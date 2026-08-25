-- Migration: 20260824000000_counter_internal_stock.sql
-- 1. Adds internal stock addition RPC (No purchase invoice, no supplier record, no payment/ledger entry).
-- 2. Adds terms_snapshot support to repair, purchase, and sale invoices for 100% immutable reprints.

-- Add terms_snapshot and warranty_notes columns if not present
ALTER TABLE public.repair_invoices
  ADD COLUMN IF NOT EXISTS terms_snapshot JSONB,
  ADD COLUMN IF NOT EXISTS warranty_notes TEXT;

ALTER TABLE public.sale_invoices
  ADD COLUMN IF NOT EXISTS terms_snapshot JSONB,
  ADD COLUMN IF NOT EXISTS warranty_notes TEXT;

ALTER TABLE public.purchase_invoices
  ADD COLUMN IF NOT EXISTS terms_snapshot JSONB;

-- Dedicated internal stock addition RPC
CREATE OR REPLACE FUNCTION public.counter_add_internal_stock(p_data JSONB)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user UUID := public.counter_require_access();
  v_stock UUID;
  v_make TEXT := trim(p_data->>'device_make');
  v_model TEXT := trim(p_data->>'device_model');
  v_storage TEXT := NULLIF(trim(p_data->>'storage'), '');
  v_colour TEXT := NULLIF(trim(p_data->>'colour'), '');
  v_imei TEXT := NULLIF(trim(p_data->>'imei'), '');
  v_serial TEXT := NULLIF(trim(p_data->>'serial'), '');
  v_condition TEXT := trim(p_data->>'device_condition');
  v_cost BIGINT := COALESCE((p_data->>'purchase_price_pence')::BIGINT, 0);
  v_expected BIGINT := NULLIF(p_data->>'expected_sale_price_pence', '')::BIGINT;
  v_note TEXT := NULLIF(trim(p_data->>'notes'), '');
BEGIN
  IF length(v_make) = 0 OR length(v_model) = 0 OR length(v_condition) = 0 THEN
    RAISE EXCEPTION 'Device brand, model, and condition are required.';
  END IF;

  IF v_imei IS NULL AND v_serial IS NULL THEN
    RAISE EXCEPTION 'Enter an IMEI or serial number.';
  END IF;

  IF v_imei IS NOT NULL AND v_imei !~ '^[0-9]{15}$' THEN
    RAISE EXCEPTION 'IMEI must contain exactly 15 numeric digits.';
  END IF;

  IF v_cost < 0 THEN
    RAISE EXCEPTION 'Cost price cannot be negative.';
  END IF;

  IF v_expected IS NOT NULL AND v_expected < 0 THEN
    RAISE EXCEPTION 'Expected selling price cannot be negative.';
  END IF;

  -- Insert directly into stock_devices WITHOUT purchase invoice or supplier record
  INSERT INTO public.stock_devices (
    purchase_invoice_id,
    device_make,
    device_model,
    storage,
    colour,
    imei,
    serial,
    device_condition,
    purchase_price_pence,
    expected_sale_price_pence,
    status
  ) VALUES (
    NULL,
    v_make,
    v_model,
    v_storage,
    v_colour,
    v_imei,
    v_serial,
    v_condition,
    v_cost,
    v_expected,
    'IN_STOCK'
  ) RETURNING id INTO v_stock;

  -- Record stock movement audit entry
  INSERT INTO public.stock_movements (
    stock_device_id,
    movement_type,
    reference,
    note,
    created_by
  ) VALUES (
    v_stock,
    'PURCHASED',
    'INTERNAL-STOCK',
    COALESCE(v_note, 'Internal shop stock addition'),
    v_user
  );

  RETURN jsonb_build_object(
    'id', v_stock,
    'stock_device_id', v_stock,
    'sku', 'STK-' || UPPER(SUBSTRING(v_stock::TEXT FROM 1 FOR 8))
  );
END; $$;

GRANT EXECUTE ON FUNCTION public.counter_add_internal_stock(JSONB) TO authenticated;
