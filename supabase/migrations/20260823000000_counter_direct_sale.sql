-- Migration: 20260823000000_counter_direct_sale.sql
-- Adds Direct Sale mode to Counter Mode, allowing direct invoicing without entering inventory.
-- Preserves existing Sell From Stock workflow, stock movement isolation, and voiding behavior.

-- 1. Alter public.sale_invoices table
ALTER TABLE public.sale_invoices
  ADD COLUMN IF NOT EXISTS sale_source TEXT NOT NULL DEFAULT 'STOCK' CHECK (sale_source IN ('STOCK', 'DIRECT')),
  ADD COLUMN IF NOT EXISTS cost_price_pence BIGINT CHECK (cost_price_pence IS NULL OR cost_price_pence >= 0);

-- Make stock_device_id nullable for DIRECT sales
ALTER TABLE public.sale_invoices ALTER COLUMN stock_device_id DROP NOT NULL;

-- Ensure stock_device_id presence strictly matches sale_source
ALTER TABLE public.sale_invoices DROP CONSTRAINT IF EXISTS sale_invoices_source_stock_check;
ALTER TABLE public.sale_invoices ADD CONSTRAINT sale_invoices_source_stock_check
  CHECK (
    (sale_source = 'STOCK' AND stock_device_id IS NOT NULL) OR
    (sale_source = 'DIRECT' AND stock_device_id IS NULL)
  );

-- Ensure valid IMEI or Serial constraints on sale_invoices
ALTER TABLE public.sale_invoices DROP CONSTRAINT IF EXISTS sale_invoices_imei_format_check;
ALTER TABLE public.sale_invoices ADD CONSTRAINT sale_invoices_imei_format_check
  CHECK (imei IS NULL OR imei ~ '^[0-9]{15}$');

ALTER TABLE public.sale_invoices DROP CONSTRAINT IF EXISTS sale_invoices_identifier_check;
ALTER TABLE public.sale_invoices ADD CONSTRAINT sale_invoices_identifier_check
  CHECK (imei IS NOT NULL OR serial IS NOT NULL);


-- 2. Update counter_create_sale RPC to handle STOCK and DIRECT sales
CREATE OR REPLACE FUNCTION public.counter_create_sale(p_data JSONB)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user UUID := public.counter_require_access();
  v_customer UUID;
  v_id UUID;
  v_stock public.stock_devices%ROWTYPE;
  v_number TEXT;
  v_price BIGINT;
  v_discount BIGINT;
  v_total BIGINT;
  v_paid BIGINT;
  v_payment UUID;
  v_source TEXT := COALESCE(NULLIF(trim(p_data->>'sale_source'), ''), 'STOCK');
  v_stock_device_id UUID := NULLIF(p_data->>'stock_device_id', '')::UUID;
  v_make TEXT;
  v_model TEXT;
  v_storage TEXT;
  v_colour TEXT;
  v_imei TEXT;
  v_serial TEXT;
  v_condition TEXT;
  v_cost_price BIGINT := NULL;
  v_warranty_days INT := COALESCE((p_data->>'warranty_days')::INT, 0);
BEGIN
  -- Check for idempotent request
  SELECT id, invoice_number INTO v_id, v_number FROM public.sale_invoices WHERE request_id = (p_data->>'request_id')::UUID;
  IF v_id IS NOT NULL THEN
    RETURN jsonb_build_object('id', v_id, 'invoice_number', v_number);
  END IF;

  IF v_source NOT IN ('STOCK', 'DIRECT') THEN
    RAISE EXCEPTION 'Invalid sale source. Must be STOCK or DIRECT.';
  END IF;

  v_price := (p_data->>'selling_price_pence')::BIGINT;
  v_discount := COALESCE((p_data->>'discount_pence')::BIGINT, 0);
  v_paid := COALESCE((p_data->>'paid_pence')::BIGINT, 0);
  v_total := v_price - v_discount;

  IF v_price < 0 OR v_discount < 0 OR v_discount > v_price OR v_paid < 0 OR v_paid > v_total THEN
    RAISE EXCEPTION 'Invalid sale totals';
  END IF;

  -- Mode A: SELL FROM STOCK
  IF v_source = 'STOCK' THEN
    IF v_stock_device_id IS NULL THEN
      RAISE EXCEPTION 'Please select a device from stock for Sell From Stock mode.';
    END IF;

    SELECT * INTO v_stock FROM public.stock_devices WHERE id = v_stock_device_id FOR UPDATE;
    IF v_stock.id IS NULL OR v_stock.status <> 'IN_STOCK' THEN
      RAISE EXCEPTION 'Phone is no longer available in stock.';
    END IF;

    v_make := v_stock.device_make;
    v_model := v_stock.device_model;
    v_storage := v_stock.storage;
    v_colour := v_stock.colour;
    v_imei := v_stock.imei;
    v_serial := v_stock.serial;
    v_condition := v_stock.device_condition;
    v_cost_price := v_stock.purchase_price_pence;

  -- Mode B: DIRECT SALE (Without entering stock)
  ELSE
    v_stock_device_id := NULL;
    v_make := NULLIF(trim(p_data->>'device_make'), '');
    v_model := NULLIF(trim(p_data->>'device_model'), '');
    v_storage := NULLIF(trim(p_data->>'storage'), '');
    v_colour := NULLIF(trim(p_data->>'colour'), '');
    v_imei := NULLIF(trim(p_data->>'imei'), '');
    v_serial := NULLIF(trim(p_data->>'serial'), '');
    v_condition := COALESCE(NULLIF(trim(p_data->>'device_condition'), ''), 'Brand New');
    v_cost_price := NULLIF(p_data->>'cost_price_pence', '')::BIGINT;

    IF v_make IS NULL OR v_model IS NULL THEN
      RAISE EXCEPTION 'Device make and model are required for Direct Sale.';
    END IF;

    IF v_imei IS NULL AND v_serial IS NULL THEN
      RAISE EXCEPTION 'Enter an IMEI or serial number for the device.';
    END IF;

    IF v_imei IS NOT NULL AND v_imei !~ '^[0-9]{15}$' THEN
      RAISE EXCEPTION 'IMEI must contain exactly 15 numeric digits.';
    END IF;

    -- Conflict check: Is this device currently in active stock?
    IF v_imei IS NOT NULL AND EXISTS(
      SELECT 1 FROM public.stock_devices WHERE status = 'IN_STOCK' AND imei = v_imei
    ) THEN
      RAISE EXCEPTION 'Device with IMEI % is currently in stock. Please use "Sell From Stock" mode.', v_imei;
    END IF;

    IF v_serial IS NOT NULL AND EXISTS(
      SELECT 1 FROM public.stock_devices WHERE status = 'IN_STOCK' AND serial = v_serial
    ) THEN
      RAISE EXCEPTION 'Device with Serial % is currently in stock. Please use "Sell From Stock" mode.', v_serial;
    END IF;
  END IF;

  -- Customer resolution / creation
  IF NULLIF(p_data->>'customer_id', '') IS NOT NULL THEN
    v_customer := (p_data->>'customer_id')::UUID;
    UPDATE public.customers
    SET name = trim(p_data->>'customer_name'),
        phone = trim(p_data->>'customer_phone'),
        updated_at = now()
    WHERE id = v_customer;
    IF NOT FOUND THEN RAISE EXCEPTION 'Customer not found'; END IF;
  ELSE
    INSERT INTO public.customers(name, phone)
    VALUES(trim(p_data->>'customer_name'), trim(p_data->>'customer_phone'))
    ON CONFLICT ((lower(trim(phone)))) DO UPDATE
      SET name = EXCLUDED.name, updated_at = now()
    RETURNING id INTO v_customer;
  END IF;

  -- Generate invoice sequence
  v_number := public.counter_next_invoice_number('SEL');

  -- Insert Sale Invoice
  INSERT INTO public.sale_invoices(
    invoice_number,
    request_id,
    sale_source,
    stock_device_id,
    customer_id,
    customer_name,
    customer_phone,
    device_make,
    device_model,
    storage,
    colour,
    imei,
    serial,
    device_condition,
    selling_price_pence,
    discount_pence,
    total_pence,
    paid_pence,
    balance_pence,
    cost_price_pence,
    payment_status,
    payment_method,
    warranty_days,
    created_by
  ) VALUES (
    v_number,
    (p_data->>'request_id')::UUID,
    v_source,
    v_stock_device_id,
    v_customer,
    trim(p_data->>'customer_name'),
    trim(p_data->>'customer_phone'),
    v_make,
    v_model,
    v_storage,
    v_colour,
    v_imei,
    v_serial,
    v_condition,
    v_price,
    v_discount,
    v_total,
    v_paid,
    v_total - v_paid,
    v_cost_price,
    public.counter_payment_status(v_total, v_paid),
    NULLIF(p_data->>'payment_method', ''),
    v_warranty_days,
    v_user
  ) RETURNING id INTO v_id;

  -- Update stock only if sale was from stock
  IF v_source = 'STOCK' THEN
    UPDATE public.stock_devices
    SET status = 'SOLD', sold_at = now(), updated_at = now()
    WHERE id = v_stock.id;

    INSERT INTO public.stock_movements(stock_device_id, movement_type, reference, note, created_by)
    VALUES(v_stock.id, 'SOLD', v_number, 'Sold to customer', v_user);
  END IF;

  -- Ledger entries
  IF v_total > 0 THEN
    INSERT INTO public.customer_ledger_entries(
      customer_id, transaction_type, invoice_kind, invoice_id, reference, description, debit_pence, created_by
    ) VALUES (
      v_customer, 'SALE_INVOICE', 'SALE', v_id, v_number,
      'Sold ' || v_make || ' ' || v_model || CASE WHEN v_source = 'DIRECT' THEN ' (Direct Sale)' ELSE '' END,
      v_total, v_user
    );
  END IF;

  -- Payment allocation
  IF v_paid > 0 THEN
    INSERT INTO public.payments(
      request_id, direction, customer_id, amount_pence, payment_method, reference_note, created_by
    ) VALUES (
      gen_random_uuid(), 'CUSTOMER_RECEIPT', v_customer, v_paid,
      COALESCE(NULLIF(p_data->>'payment_method', ''), 'OTHER'),
      'Initial payment ' || v_number, v_user
    ) RETURNING id INTO v_payment;

    INSERT INTO public.payment_allocations(payment_id, invoice_kind, invoice_id, amount_pence)
    VALUES(v_payment, 'SALE', v_id, v_paid);

    INSERT INTO public.customer_ledger_entries(
      customer_id, transaction_type, invoice_kind, invoice_id, payment_id, reference, description, credit_pence, created_by
    ) VALUES (
      v_customer, 'PAYMENT_RECEIVED', 'SALE', v_id, v_payment, v_number, 'Payment received', v_paid, v_user
    );
  END IF;

  RETURN jsonb_build_object('id', v_id, 'invoice_number', v_number);
END; $$;


-- 3. Update counter_void_invoice RPC to restore stock only for STOCK sales
CREATE OR REPLACE FUNCTION public.counter_void_invoice(p_kind TEXT, p_invoice_id UUID, p_reason TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user UUID := public.counter_require_access();
  r RECORD;
BEGIN
  IF length(trim(p_reason)) < 3 THEN
    RAISE EXCEPTION 'Void reason is required (min 3 characters)';
  END IF;

  IF p_kind = 'REPAIR' THEN
    SELECT * INTO r FROM public.repair_invoices WHERE id = p_invoice_id FOR UPDATE;
    IF r.id IS NULL OR r.status = 'VOID' THEN RAISE EXCEPTION 'Invoice not available'; END IF;

    UPDATE public.repair_invoices
    SET status = 'VOID', void_reason = trim(p_reason), voided_at = now(), voided_by = v_user, updated_at = now()
    WHERE id = r.id;

    IF r.total_pence > 0 THEN
      INSERT INTO public.customer_ledger_entries(customer_id, transaction_type, invoice_kind, invoice_id, reference, description, credit_pence, reason, created_by)
      VALUES(r.customer_id, 'VOID_REVERSAL', 'REPAIR', r.id, r.invoice_number, 'Voided repair invoice', r.total_pence, trim(p_reason), v_user);
    END IF;
    IF r.paid_pence > 0 THEN
      INSERT INTO public.customer_ledger_entries(customer_id, transaction_type, invoice_kind, invoice_id, reference, description, debit_pence, reason, created_by)
      VALUES(r.customer_id, 'CUSTOMER_REFUND', 'REPAIR', r.id, r.invoice_number, 'Refund on voided repair', r.paid_pence, trim(p_reason), v_user);
    END IF;

  ELSIF p_kind = 'SALE' THEN
    SELECT * INTO r FROM public.sale_invoices WHERE id = p_invoice_id FOR UPDATE;
    IF r.id IS NULL OR r.status = 'VOID' THEN RAISE EXCEPTION 'Invoice not available'; END IF;

    UPDATE public.sale_invoices
    SET status = 'VOID', void_reason = trim(p_reason), voided_at = now(), voided_by = v_user, updated_at = now()
    WHERE id = r.id;

    -- Only restock if the sale was made from stock
    IF r.sale_source = 'STOCK' AND r.stock_device_id IS NOT NULL THEN
      UPDATE public.stock_devices
      SET status = 'IN_STOCK', sold_at = NULL, updated_at = now()
      WHERE id = r.stock_device_id;

      INSERT INTO public.stock_movements(stock_device_id, movement_type, reference, note, created_by)
      VALUES(r.stock_device_id, 'SALE_VOIDED', r.invoice_number, trim(p_reason), v_user);
    END IF;

    IF r.total_pence > 0 THEN
      INSERT INTO public.customer_ledger_entries(customer_id, transaction_type, invoice_kind, invoice_id, reference, description, credit_pence, reason, created_by)
      VALUES(r.customer_id, 'VOID_REVERSAL', 'SALE', r.id, r.invoice_number, 'Voided sale invoice', r.total_pence, trim(p_reason), v_user);
    END IF;
    IF r.paid_pence > 0 THEN
      INSERT INTO public.customer_ledger_entries(customer_id, transaction_type, invoice_kind, invoice_id, reference, description, debit_pence, reason, created_by)
      VALUES(r.customer_id, 'CUSTOMER_REFUND', 'SALE', r.id, r.invoice_number, 'Refund on voided sale', r.paid_pence, trim(p_reason), v_user);
    END IF;

  ELSIF p_kind = 'PURCHASE' THEN
    SELECT * INTO r FROM public.purchase_invoices WHERE id = p_invoice_id FOR UPDATE;
    IF r.id IS NULL OR r.status = 'VOID' THEN RAISE EXCEPTION 'Invoice not available'; END IF;

    IF EXISTS(SELECT 1 FROM public.stock_devices WHERE purchase_invoice_id = r.id AND status = 'SOLD') THEN
      RAISE EXCEPTION 'Cannot void purchase: phone has already been sold';
    END IF;

    UPDATE public.purchase_invoices
    SET status = 'VOID', void_reason = trim(p_reason), voided_at = now(), voided_by = v_user, updated_at = now()
    WHERE id = r.id;

    UPDATE public.stock_devices SET status = 'REMOVED', updated_at = now() WHERE purchase_invoice_id = r.id;

    INSERT INTO public.stock_movements(stock_device_id, movement_type, reference, note, created_by)
      SELECT id, 'REMOVED', r.invoice_number, trim(p_reason), v_user FROM public.stock_devices WHERE purchase_invoice_id = r.id;

    IF r.purchase_price_pence > 0 THEN
      INSERT INTO public.supplier_ledger_entries(supplier_id, transaction_type, purchase_invoice_id, reference, description, credit_pence, reason, created_by)
      VALUES(r.supplier_id, 'VOID_REVERSAL', r.id, r.invoice_number, 'Voided purchase invoice', r.purchase_price_pence, trim(p_reason), v_user);
    END IF;
    IF r.paid_pence > 0 THEN
      INSERT INTO public.supplier_ledger_entries(supplier_id, transaction_type, purchase_invoice_id, reference, description, debit_pence, reason, created_by)
      VALUES(r.supplier_id, 'SUPPLIER_REFUND', r.id, r.invoice_number, 'Supplier refund on voided purchase', r.paid_pence, trim(p_reason), v_user);
    END IF;

  ELSE
    RAISE EXCEPTION 'Invalid invoice kind';
  END IF;

  RETURN jsonb_build_object('ok', true);
END; $$;

GRANT EXECUTE ON FUNCTION public.counter_create_sale(JSONB) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.counter_void_invoice(TEXT, UUID, TEXT) TO authenticated, service_role;
