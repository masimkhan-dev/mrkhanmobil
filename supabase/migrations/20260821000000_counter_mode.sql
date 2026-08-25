-- MR KHAN Counter Mode
-- Transactional repair, phone buy/sell, serialized stock, and lightweight ledgers.

CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  phone TEXT NOT NULL CHECK (length(trim(phone)) >= 6),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX customers_phone_unique_idx ON public.customers (lower(trim(phone)));
CREATE INDEX customers_name_idx ON public.customers (lower(name));

CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  phone TEXT NOT NULL CHECK (length(trim(phone)) >= 6),
  id_reference TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX suppliers_phone_unique_idx ON public.suppliers (lower(trim(phone)));
CREATE INDEX suppliers_name_idx ON public.suppliers (lower(name));

CREATE TABLE public.invoice_sequences (
  prefix TEXT PRIMARY KEY CHECK (prefix IN ('REP', 'SEL', 'BUY')),
  last_number BIGINT NOT NULL DEFAULT 0 CHECK (last_number >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO public.invoice_sequences (prefix) VALUES ('REP'), ('SEL'), ('BUY');

CREATE TABLE public.repair_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  request_id UUID NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  device_make TEXT NOT NULL CHECK (length(trim(device_make)) > 0),
  device_model TEXT NOT NULL CHECK (length(trim(device_model)) > 0),
  imei_serial TEXT,
  problem TEXT NOT NULL CHECK (length(trim(problem)) > 0),
  repair_work TEXT NOT NULL CHECK (length(trim(repair_work)) > 0),
  shop_note TEXT,
  subtotal_pence BIGINT NOT NULL CHECK (subtotal_pence >= 0),
  discount_pence BIGINT NOT NULL DEFAULT 0 CHECK (discount_pence >= 0),
  total_pence BIGINT NOT NULL CHECK (total_pence >= 0),
  paid_pence BIGINT NOT NULL DEFAULT 0 CHECK (paid_pence >= 0),
  balance_pence BIGINT NOT NULL CHECK (balance_pence >= 0),
  payment_status TEXT NOT NULL CHECK (payment_status IN ('UNPAID','PARTIAL','PAID')),
  payment_method TEXT CHECK (payment_method IS NULL OR payment_method IN ('CASH','CARD','BANK_TRANSFER','OTHER')),
  warranty_days INT NOT NULL DEFAULT 0 CHECK (warranty_days >= 0 AND warranty_days <= 3650),
  status TEXT NOT NULL DEFAULT 'FINAL' CHECK (status IN ('FINAL','VOID')),
  void_reason TEXT,
  voided_at TIMESTAMPTZ,
  voided_by UUID REFERENCES auth.users(id),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (total_pence = subtotal_pence - discount_pence),
  CHECK (paid_pence + balance_pence = total_pence)
);

CREATE TABLE public.purchase_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  request_id UUID NOT NULL UNIQUE,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id),
  supplier_name TEXT NOT NULL,
  supplier_phone TEXT NOT NULL,
  id_reference TEXT,
  seller_note TEXT,
  device_make TEXT NOT NULL CHECK (length(trim(device_make)) > 0),
  device_model TEXT NOT NULL CHECK (length(trim(device_model)) > 0),
  storage TEXT,
  colour TEXT,
  imei TEXT,
  serial TEXT,
  device_condition TEXT NOT NULL CHECK (length(trim(device_condition)) > 0),
  purchase_price_pence BIGINT NOT NULL CHECK (purchase_price_pence >= 0),
  paid_pence BIGINT NOT NULL DEFAULT 0 CHECK (paid_pence >= 0),
  balance_pence BIGINT NOT NULL CHECK (balance_pence >= 0),
  expected_sale_price_pence BIGINT CHECK (expected_sale_price_pence IS NULL OR expected_sale_price_pence >= 0),
  payment_status TEXT NOT NULL CHECK (payment_status IN ('UNPAID','PARTIAL','PAID')),
  payment_method TEXT CHECK (payment_method IS NULL OR payment_method IN ('CASH','CARD','BANK_TRANSFER','OTHER')),
  status TEXT NOT NULL DEFAULT 'FINAL' CHECK (status IN ('FINAL','VOID')),
  void_reason TEXT,
  voided_at TIMESTAMPTZ,
  voided_by UUID REFERENCES auth.users(id),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (paid_pence + balance_pence = purchase_price_pence),
  CHECK (imei IS NOT NULL OR serial IS NOT NULL),
  CHECK (imei IS NULL OR imei ~ '^[0-9]{15}$')
);

CREATE TABLE public.stock_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_invoice_id UUID REFERENCES public.purchase_invoices(id),
  device_make TEXT NOT NULL CHECK (length(trim(device_make)) > 0),
  device_model TEXT NOT NULL CHECK (length(trim(device_model)) > 0),
  storage TEXT,
  colour TEXT,
  imei TEXT,
  serial TEXT,
  device_condition TEXT NOT NULL CHECK (length(trim(device_condition)) > 0),
  purchase_price_pence BIGINT NOT NULL CHECK (purchase_price_pence >= 0),
  expected_sale_price_pence BIGINT CHECK (expected_sale_price_pence IS NULL OR expected_sale_price_pence >= 0),
  status TEXT NOT NULL DEFAULT 'IN_STOCK' CHECK (status IN ('IN_STOCK','SOLD','REMOVED')),
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sold_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (imei IS NOT NULL OR serial IS NOT NULL),
  CHECK (imei IS NULL OR imei ~ '^[0-9]{15}$')
);
CREATE UNIQUE INDEX stock_active_imei_idx ON public.stock_devices (lower(trim(imei)))
  WHERE imei IS NOT NULL AND status <> 'REMOVED';
CREATE UNIQUE INDEX stock_active_serial_idx ON public.stock_devices (lower(trim(serial)))
  WHERE serial IS NOT NULL AND status <> 'REMOVED';
CREATE INDEX stock_status_idx ON public.stock_devices(status, created_at DESC);

CREATE TABLE public.sale_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  request_id UUID NOT NULL UNIQUE,
  stock_device_id UUID NOT NULL REFERENCES public.stock_devices(id),
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  device_make TEXT NOT NULL CHECK (length(trim(device_make)) > 0),
  device_model TEXT NOT NULL CHECK (length(trim(device_model)) > 0),
  storage TEXT,
  colour TEXT,
  imei TEXT,
  serial TEXT,
  device_condition TEXT NOT NULL CHECK (length(trim(device_condition)) > 0),
  selling_price_pence BIGINT NOT NULL CHECK (selling_price_pence >= 0),
  discount_pence BIGINT NOT NULL DEFAULT 0 CHECK (discount_pence >= 0),
  total_pence BIGINT NOT NULL CHECK (total_pence >= 0),
  paid_pence BIGINT NOT NULL DEFAULT 0 CHECK (paid_pence >= 0),
  balance_pence BIGINT NOT NULL CHECK (balance_pence >= 0),
  payment_status TEXT NOT NULL CHECK (payment_status IN ('UNPAID','PARTIAL','PAID')),
  payment_method TEXT CHECK (payment_method IS NULL OR payment_method IN ('CASH','CARD','BANK_TRANSFER','OTHER')),
  warranty_days INT NOT NULL DEFAULT 0 CHECK (warranty_days >= 0 AND warranty_days <= 3650),
  status TEXT NOT NULL DEFAULT 'FINAL' CHECK (status IN ('FINAL','VOID')),
  void_reason TEXT,
  voided_at TIMESTAMPTZ,
  voided_by UUID REFERENCES auth.users(id),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (total_pence = selling_price_pence - discount_pence),
  CHECK (paid_pence + balance_pence = total_pence),
  CHECK (imei IS NULL OR imei ~ '^[0-9]{15}$')
);
CREATE UNIQUE INDEX sale_active_stock_idx ON public.sale_invoices(stock_device_id) WHERE status = 'FINAL';

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL UNIQUE,
  direction TEXT NOT NULL CHECK (direction IN ('CUSTOMER_RECEIPT','SUPPLIER_PAYMENT')),
  customer_id UUID REFERENCES public.customers(id),
  supplier_id UUID REFERENCES public.suppliers(id),
  amount_pence BIGINT NOT NULL CHECK (amount_pence > 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('CASH','CARD','BANK_TRANSFER','OTHER')),
  reference_note TEXT,
  status TEXT NOT NULL DEFAULT 'POSTED' CHECK (status IN ('POSTED','VOID')),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  voided_at TIMESTAMPTZ,
  voided_by UUID REFERENCES auth.users(id),
  CHECK (
    (direction = 'CUSTOMER_RECEIPT' AND customer_id IS NOT NULL AND supplier_id IS NULL) OR
    (direction = 'SUPPLIER_PAYMENT' AND supplier_id IS NOT NULL AND customer_id IS NULL)
  )
);

CREATE TABLE public.payment_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE RESTRICT,
  invoice_kind TEXT NOT NULL CHECK (invoice_kind IN ('REPAIR','SALE','PURCHASE')),
  invoice_id UUID NOT NULL,
  amount_pence BIGINT NOT NULL CHECK (amount_pence > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(payment_id, invoice_kind, invoice_id)
);

CREATE TABLE public.customer_ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('REPAIR_INVOICE','SALE_INVOICE','PAYMENT_RECEIVED','CUSTOMER_REFUND','VOID_REVERSAL','ADJUSTMENT')),
  invoice_kind TEXT CHECK (invoice_kind IN ('REPAIR','SALE')),
  invoice_id UUID,
  payment_id UUID REFERENCES public.payments(id),
  reference TEXT NOT NULL,
  description TEXT NOT NULL,
  debit_pence BIGINT NOT NULL DEFAULT 0 CHECK (debit_pence >= 0),
  credit_pence BIGINT NOT NULL DEFAULT 0 CHECK (credit_pence >= 0),
  reason TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((debit_pence > 0 AND credit_pence = 0) OR (credit_pence > 0 AND debit_pence = 0))
);
CREATE INDEX customer_ledger_party_idx ON public.customer_ledger_entries(customer_id, created_at);

CREATE TABLE public.supplier_ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('PURCHASE_INVOICE','PAYMENT_MADE','SUPPLIER_REFUND','VOID_REVERSAL','ADJUSTMENT')),
  purchase_invoice_id UUID REFERENCES public.purchase_invoices(id),
  payment_id UUID REFERENCES public.payments(id),
  reference TEXT NOT NULL,
  description TEXT NOT NULL,
  debit_pence BIGINT NOT NULL DEFAULT 0 CHECK (debit_pence >= 0),
  credit_pence BIGINT NOT NULL DEFAULT 0 CHECK (credit_pence >= 0),
  reason TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((debit_pence > 0 AND credit_pence = 0) OR (credit_pence > 0 AND debit_pence = 0))
);
CREATE INDEX supplier_ledger_party_idx ON public.supplier_ledger_entries(supplier_id, created_at);

CREATE TABLE public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_device_id UUID NOT NULL REFERENCES public.stock_devices(id),
  movement_type TEXT NOT NULL CHECK (movement_type IN ('PURCHASED','ADDED_TO_STOCK','SOLD','SALE_VOIDED','RETURNED_TO_STOCK','REMOVED','CORRECTED')),
  reference TEXT NOT NULL,
  note TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX stock_movements_device_idx ON public.stock_movements(stock_device_id, created_at);

CREATE INDEX repair_invoices_customer_idx ON public.repair_invoices(customer_id, created_at DESC);
CREATE INDEX repair_invoices_number_idx ON public.repair_invoices(invoice_number);
CREATE INDEX purchase_invoices_supplier_idx ON public.purchase_invoices(supplier_id, created_at DESC);
CREATE INDEX sale_invoices_customer_idx ON public.sale_invoices(customer_id, created_at DESC);

-- All Counter Mode tables are private. Access is through authenticated server functions/RPCs.
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_ledger_entries ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'customers','suppliers','invoice_sequences','repair_invoices','purchase_invoices',
    'sale_invoices','stock_devices','stock_movements','payments','payment_allocations',
    'customer_ledger_entries','supplier_ledger_entries'
  ] LOOP
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.counter_require_access()
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_user UUID := auth.uid();
BEGIN
  IF v_user IS NULL OR NOT (public.has_role(v_user, 'admin') OR public.has_role(v_user, 'staff')) THEN
    RAISE EXCEPTION 'Forbidden: counter access required';
  END IF;
  RETURN v_user;
END; $$;

CREATE OR REPLACE FUNCTION public.counter_next_invoice_number(p_prefix TEXT)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_number BIGINT;
BEGIN
  IF p_prefix NOT IN ('REP','SEL','BUY') THEN RAISE EXCEPTION 'Invalid invoice prefix'; END IF;
  UPDATE public.invoice_sequences
    SET last_number = last_number + 1, updated_at = now()
    WHERE prefix = p_prefix
    RETURNING last_number INTO v_number;
  IF v_number IS NULL THEN RAISE EXCEPTION 'Invoice sequence missing'; END IF;
  RETURN p_prefix || '-' || lpad(v_number::TEXT, 6, '0');
END; $$;

CREATE OR REPLACE FUNCTION public.counter_payment_status(p_total BIGINT, p_paid BIGINT)
RETURNS TEXT LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE WHEN p_total = 0 OR p_paid >= p_total THEN 'PAID' WHEN p_paid <= 0 THEN 'UNPAID' ELSE 'PARTIAL' END
$$;

CREATE OR REPLACE FUNCTION public.counter_create_repair(p_data JSONB)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user UUID := public.counter_require_access(); v_customer UUID; v_id UUID;
  v_number TEXT; v_subtotal BIGINT; v_discount BIGINT; v_total BIGINT; v_paid BIGINT; v_payment UUID;
BEGIN
  SELECT id, invoice_number INTO v_id, v_number FROM public.repair_invoices WHERE request_id=(p_data->>'request_id')::UUID;
  IF v_id IS NOT NULL THEN RETURN jsonb_build_object('id',v_id,'invoice_number',v_number); END IF;
  v_subtotal := (p_data->>'subtotal_pence')::BIGINT;
  v_discount := COALESCE((p_data->>'discount_pence')::BIGINT, 0);
  v_paid := COALESCE((p_data->>'paid_pence')::BIGINT, 0);
  v_total := v_subtotal - v_discount;
  IF v_subtotal < 0 OR v_discount < 0 OR v_discount > v_subtotal OR v_paid < 0 OR v_paid > v_total THEN
    RAISE EXCEPTION 'Invalid repair totals';
  END IF;
  IF NULLIF(p_data->>'customer_id','') IS NOT NULL THEN
    v_customer := (p_data->>'customer_id')::UUID;
    UPDATE public.customers SET name = trim(p_data->>'customer_name'), phone = trim(p_data->>'customer_phone'), updated_at = now() WHERE id = v_customer;
    IF NOT FOUND THEN RAISE EXCEPTION 'Customer not found'; END IF;
  ELSE
    INSERT INTO public.customers(name, phone) VALUES(trim(p_data->>'customer_name'), trim(p_data->>'customer_phone'))
      ON CONFLICT ((lower(trim(phone)))) DO UPDATE SET name = EXCLUDED.name, updated_at = now()
      RETURNING id INTO v_customer;
  END IF;
  v_number := public.counter_next_invoice_number('REP');
  INSERT INTO public.repair_invoices(
    invoice_number, request_id, customer_id, customer_name, customer_phone, device_make, device_model,
    imei_serial, problem, repair_work, shop_note, subtotal_pence, discount_pence, total_pence,
    paid_pence, balance_pence, payment_status, payment_method, warranty_days, created_by
  ) VALUES (
    v_number, (p_data->>'request_id')::UUID, v_customer, trim(p_data->>'customer_name'), trim(p_data->>'customer_phone'),
    trim(p_data->>'device_make'), trim(p_data->>'device_model'), NULLIF(trim(p_data->>'imei_serial'),''),
    trim(p_data->>'problem'), trim(p_data->>'repair_work'), NULLIF(trim(p_data->>'shop_note'),''),
    v_subtotal, v_discount, v_total, v_paid, v_total-v_paid, public.counter_payment_status(v_total,v_paid),
    NULLIF(p_data->>'payment_method',''), COALESCE((p_data->>'warranty_days')::INT,0), v_user
  ) RETURNING id INTO v_id;
  IF v_total > 0 THEN
    INSERT INTO public.customer_ledger_entries(customer_id,transaction_type,invoice_kind,invoice_id,reference,description,debit_pence,created_by)
      VALUES(v_customer,'REPAIR_INVOICE','REPAIR',v_id,v_number,trim(p_data->>'device_make')||' '||trim(p_data->>'device_model')||' Repair',v_total,v_user);
  END IF;
  IF v_paid > 0 THEN
    INSERT INTO public.payments(request_id,direction,customer_id,amount_pence,payment_method,reference_note,created_by)
      VALUES(gen_random_uuid(),'CUSTOMER_RECEIPT',v_customer,v_paid,COALESCE(NULLIF(p_data->>'payment_method',''),'OTHER'),'Initial payment '||v_number,v_user) RETURNING id INTO v_payment;
    INSERT INTO public.payment_allocations(payment_id,invoice_kind,invoice_id,amount_pence) VALUES(v_payment,'REPAIR',v_id,v_paid);
    INSERT INTO public.customer_ledger_entries(customer_id,transaction_type,invoice_kind,invoice_id,payment_id,reference,description,credit_pence,created_by)
      VALUES(v_customer,'PAYMENT_RECEIVED','REPAIR',v_id,v_payment,v_number,'Payment received',v_paid,v_user);
  END IF;
  RETURN jsonb_build_object('id',v_id,'invoice_number',v_number);
END; $$;

CREATE OR REPLACE FUNCTION public.counter_create_purchase(p_data JSONB)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user UUID := public.counter_require_access(); v_supplier UUID; v_id UUID; v_stock UUID;
  v_number TEXT; v_total BIGINT; v_paid BIGINT; v_payment UUID;
BEGIN
  SELECT id, invoice_number INTO v_id, v_number FROM public.purchase_invoices WHERE request_id=(p_data->>'request_id')::UUID;
  IF v_id IS NOT NULL THEN RETURN jsonb_build_object('id',v_id,'invoice_number',v_number); END IF;
  v_total := (p_data->>'purchase_price_pence')::BIGINT;
  v_paid := COALESCE((p_data->>'paid_pence')::BIGINT,0);
  IF v_total < 0 OR v_paid < 0 OR v_paid > v_total THEN RAISE EXCEPTION 'Invalid purchase totals'; END IF;
  IF NULLIF(p_data->>'supplier_id','') IS NOT NULL THEN
    v_supplier := (p_data->>'supplier_id')::UUID;
    UPDATE public.suppliers SET name=trim(p_data->>'supplier_name'),phone=trim(p_data->>'supplier_phone'),
      id_reference=NULLIF(trim(p_data->>'id_reference'),''),updated_at=now() WHERE id=v_supplier;
    IF NOT FOUND THEN RAISE EXCEPTION 'Supplier not found'; END IF;
  ELSE
    INSERT INTO public.suppliers(name,phone,id_reference,note)
      VALUES(trim(p_data->>'supplier_name'),trim(p_data->>'supplier_phone'),NULLIF(trim(p_data->>'id_reference'),''),NULLIF(trim(p_data->>'seller_note'),''))
      ON CONFLICT ((lower(trim(phone)))) DO UPDATE SET name=EXCLUDED.name,id_reference=COALESCE(EXCLUDED.id_reference,public.suppliers.id_reference),updated_at=now()
      RETURNING id INTO v_supplier;
  END IF;
  v_number := public.counter_next_invoice_number('BUY');
  INSERT INTO public.purchase_invoices(
    invoice_number,request_id,supplier_id,supplier_name,supplier_phone,id_reference,seller_note,device_make,device_model,
    storage,colour,imei,serial,device_condition,purchase_price_pence,paid_pence,balance_pence,
    expected_sale_price_pence,payment_status,payment_method,created_by
  ) VALUES (
    v_number,(p_data->>'request_id')::UUID,v_supplier,trim(p_data->>'supplier_name'),trim(p_data->>'supplier_phone'),NULLIF(trim(p_data->>'id_reference'),''),
    NULLIF(trim(p_data->>'seller_note'),''),trim(p_data->>'device_make'),trim(p_data->>'device_model'),NULLIF(trim(p_data->>'storage'),''),
    NULLIF(trim(p_data->>'colour'),''),NULLIF(trim(p_data->>'imei'),''),NULLIF(trim(p_data->>'serial'),''),trim(p_data->>'device_condition'),
    v_total,v_paid,v_total-v_paid,NULLIF(p_data->>'expected_sale_price_pence','')::BIGINT,public.counter_payment_status(v_total,v_paid),
    NULLIF(p_data->>'payment_method',''),v_user
  ) RETURNING id INTO v_id;
  INSERT INTO public.stock_devices(purchase_invoice_id,device_make,device_model,storage,colour,imei,serial,device_condition,purchase_price_pence,expected_sale_price_pence)
    VALUES(v_id,trim(p_data->>'device_make'),trim(p_data->>'device_model'),NULLIF(trim(p_data->>'storage'),''),NULLIF(trim(p_data->>'colour'),''),
      NULLIF(trim(p_data->>'imei'),''),NULLIF(trim(p_data->>'serial'),''),trim(p_data->>'device_condition'),v_total,NULLIF(p_data->>'expected_sale_price_pence','')::BIGINT)
    RETURNING id INTO v_stock;
  INSERT INTO public.stock_movements(stock_device_id,movement_type,reference,note,created_by)
    VALUES(v_stock,'PURCHASED',v_number,'Purchased and added to stock',v_user);
  IF v_total > 0 THEN
    INSERT INTO public.supplier_ledger_entries(supplier_id,transaction_type,purchase_invoice_id,reference,description,debit_pence,created_by)
      VALUES(v_supplier,'PURCHASE_INVOICE',v_id,v_number,'Purchased '||trim(p_data->>'device_make')||' '||trim(p_data->>'device_model'),v_total,v_user);
  END IF;
  IF v_paid > 0 THEN
    INSERT INTO public.payments(request_id,direction,supplier_id,amount_pence,payment_method,reference_note,created_by)
      VALUES(gen_random_uuid(),'SUPPLIER_PAYMENT',v_supplier,v_paid,COALESCE(NULLIF(p_data->>'payment_method',''),'OTHER'),'Initial payment '||v_number,v_user) RETURNING id INTO v_payment;
    INSERT INTO public.payment_allocations(payment_id,invoice_kind,invoice_id,amount_pence) VALUES(v_payment,'PURCHASE',v_id,v_paid);
    INSERT INTO public.supplier_ledger_entries(supplier_id,transaction_type,purchase_invoice_id,payment_id,reference,description,credit_pence,created_by)
      VALUES(v_supplier,'PAYMENT_MADE',v_id,v_payment,v_number,'Payment to supplier',v_paid,v_user);
  END IF;
  RETURN jsonb_build_object('id',v_id,'stock_device_id',v_stock,'invoice_number',v_number);
END; $$;

CREATE OR REPLACE FUNCTION public.counter_create_sale(p_data JSONB)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user UUID := public.counter_require_access(); v_customer UUID; v_id UUID; v_stock public.stock_devices%ROWTYPE;
  v_number TEXT; v_price BIGINT; v_discount BIGINT; v_total BIGINT; v_paid BIGINT; v_payment UUID;
BEGIN
  SELECT id, invoice_number INTO v_id, v_number FROM public.sale_invoices WHERE request_id=(p_data->>'request_id')::UUID;
  IF v_id IS NOT NULL THEN RETURN jsonb_build_object('id',v_id,'invoice_number',v_number); END IF;
  SELECT * INTO v_stock FROM public.stock_devices WHERE id=(p_data->>'stock_device_id')::UUID FOR UPDATE;
  IF v_stock.id IS NULL OR v_stock.status <> 'IN_STOCK' THEN RAISE EXCEPTION 'Phone is not available in stock'; END IF;
  v_price := (p_data->>'selling_price_pence')::BIGINT;
  v_discount := COALESCE((p_data->>'discount_pence')::BIGINT,0);
  v_paid := COALESCE((p_data->>'paid_pence')::BIGINT,0);
  v_total := v_price-v_discount;
  IF v_price < 0 OR v_discount < 0 OR v_discount > v_price OR v_paid < 0 OR v_paid > v_total THEN RAISE EXCEPTION 'Invalid sale totals'; END IF;
  IF NULLIF(p_data->>'customer_id','') IS NOT NULL THEN
    v_customer := (p_data->>'customer_id')::UUID;
    UPDATE public.customers SET name=trim(p_data->>'customer_name'),phone=trim(p_data->>'customer_phone'),updated_at=now() WHERE id=v_customer;
    IF NOT FOUND THEN RAISE EXCEPTION 'Customer not found'; END IF;
  ELSE
    INSERT INTO public.customers(name,phone) VALUES(trim(p_data->>'customer_name'),trim(p_data->>'customer_phone'))
      ON CONFLICT ((lower(trim(phone)))) DO UPDATE SET name=EXCLUDED.name,updated_at=now() RETURNING id INTO v_customer;
  END IF;
  v_number := public.counter_next_invoice_number('SEL');
  INSERT INTO public.sale_invoices(
    invoice_number,request_id,stock_device_id,customer_id,customer_name,customer_phone,device_make,device_model,storage,colour,imei,serial,
    device_condition,selling_price_pence,discount_pence,total_pence,paid_pence,balance_pence,payment_status,payment_method,warranty_days,created_by
  ) VALUES (
    v_number,(p_data->>'request_id')::UUID,v_stock.id,v_customer,trim(p_data->>'customer_name'),trim(p_data->>'customer_phone'),v_stock.device_make,v_stock.device_model,
    v_stock.storage,v_stock.colour,v_stock.imei,v_stock.serial,v_stock.device_condition,v_price,v_discount,v_total,v_paid,v_total-v_paid,
    public.counter_payment_status(v_total,v_paid),NULLIF(p_data->>'payment_method',''),COALESCE((p_data->>'warranty_days')::INT,0),v_user
  ) RETURNING id INTO v_id;
  UPDATE public.stock_devices SET status='SOLD',sold_at=now(),updated_at=now() WHERE id=v_stock.id;
  INSERT INTO public.stock_movements(stock_device_id,movement_type,reference,note,created_by) VALUES(v_stock.id,'SOLD',v_number,'Sold to customer',v_user);
  IF v_total > 0 THEN
    INSERT INTO public.customer_ledger_entries(customer_id,transaction_type,invoice_kind,invoice_id,reference,description,debit_pence,created_by)
      VALUES(v_customer,'SALE_INVOICE','SALE',v_id,v_number,'Sold '||v_stock.device_make||' '||v_stock.device_model,v_total,v_user);
  END IF;
  IF v_paid > 0 THEN
    INSERT INTO public.payments(request_id,direction,customer_id,amount_pence,payment_method,reference_note,created_by)
      VALUES(gen_random_uuid(),'CUSTOMER_RECEIPT',v_customer,v_paid,COALESCE(NULLIF(p_data->>'payment_method',''),'OTHER'),'Initial payment '||v_number,v_user) RETURNING id INTO v_payment;
    INSERT INTO public.payment_allocations(payment_id,invoice_kind,invoice_id,amount_pence) VALUES(v_payment,'SALE',v_id,v_paid);
    INSERT INTO public.customer_ledger_entries(customer_id,transaction_type,invoice_kind,invoice_id,payment_id,reference,description,credit_pence,created_by)
      VALUES(v_customer,'PAYMENT_RECEIVED','SALE',v_id,v_payment,v_number,'Payment received',v_paid,v_user);
  END IF;
  RETURN jsonb_build_object('id',v_id,'invoice_number',v_number);
END; $$;

CREATE OR REPLACE FUNCTION public.counter_receive_customer_payment(p_data JSONB)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user UUID := public.counter_require_access(); v_customer UUID := (p_data->>'customer_id')::UUID;
  v_amount BIGINT := (p_data->>'amount_pence')::BIGINT; v_remaining BIGINT; v_apply BIGINT; v_payment UUID; r RECORD;
BEGIN
  IF v_amount <= 0 THEN RAISE EXCEPTION 'Payment must be greater than zero'; END IF;
  SELECT id INTO v_payment FROM public.payments WHERE request_id=(p_data->>'request_id')::UUID;
  IF v_payment IS NOT NULL THEN RETURN jsonb_build_object('payment_id',v_payment,'amount_pence',v_amount); END IF;
  SELECT COALESCE(SUM(debit_pence-credit_pence),0) INTO v_remaining FROM public.customer_ledger_entries WHERE customer_id=v_customer;
  IF v_amount > v_remaining THEN RAISE EXCEPTION 'Payment exceeds customer amount due'; END IF;
  INSERT INTO public.payments(request_id,direction,customer_id,amount_pence,payment_method,reference_note,created_by)
    VALUES((p_data->>'request_id')::UUID,'CUSTOMER_RECEIPT',v_customer,v_amount,trim(p_data->>'payment_method'),NULLIF(trim(p_data->>'reference_note'),''),v_user) RETURNING id INTO v_payment;
  v_remaining := v_amount;
  FOR r IN
    SELECT * FROM (
      SELECT 'REPAIR' kind,id,invoice_number,balance_pence,created_at FROM public.repair_invoices WHERE customer_id=v_customer AND status='FINAL' AND balance_pence>0
      UNION ALL
      SELECT 'SALE',id,invoice_number,balance_pence,created_at FROM public.sale_invoices WHERE customer_id=v_customer AND status='FINAL' AND balance_pence>0
    ) q ORDER BY created_at
  LOOP
    EXIT WHEN v_remaining=0;
    v_apply := LEAST(v_remaining,r.balance_pence);
    IF r.kind='REPAIR' THEN
      UPDATE public.repair_invoices SET paid_pence=paid_pence+v_apply,balance_pence=balance_pence-v_apply,
        payment_status=public.counter_payment_status(total_pence,paid_pence+v_apply),updated_at=now() WHERE id=r.id;
    ELSE
      UPDATE public.sale_invoices SET paid_pence=paid_pence+v_apply,balance_pence=balance_pence-v_apply,
        payment_status=public.counter_payment_status(total_pence,paid_pence+v_apply),updated_at=now() WHERE id=r.id;
    END IF;
    INSERT INTO public.payment_allocations(payment_id,invoice_kind,invoice_id,amount_pence) VALUES(v_payment,r.kind,r.id,v_apply);
    INSERT INTO public.customer_ledger_entries(customer_id,transaction_type,invoice_kind,invoice_id,payment_id,reference,description,credit_pence,created_by)
      VALUES(v_customer,'PAYMENT_RECEIVED',r.kind,r.id,v_payment,r.invoice_number,'Payment received',v_apply,v_user);
    v_remaining := v_remaining-v_apply;
  END LOOP;
  RETURN jsonb_build_object('payment_id',v_payment,'amount_pence',v_amount);
END; $$;

CREATE OR REPLACE FUNCTION public.counter_pay_supplier(p_data JSONB)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user UUID := public.counter_require_access(); v_supplier UUID := (p_data->>'supplier_id')::UUID;
  v_amount BIGINT := (p_data->>'amount_pence')::BIGINT; v_due BIGINT; v_remaining BIGINT; v_apply BIGINT; v_payment UUID; r RECORD;
BEGIN
  IF v_amount <= 0 THEN RAISE EXCEPTION 'Payment must be greater than zero'; END IF;
  SELECT id INTO v_payment FROM public.payments WHERE request_id=(p_data->>'request_id')::UUID;
  IF v_payment IS NOT NULL THEN RETURN jsonb_build_object('payment_id',v_payment,'amount_pence',v_amount); END IF;
  SELECT COALESCE(SUM(debit_pence-credit_pence),0) INTO v_due FROM public.supplier_ledger_entries WHERE supplier_id=v_supplier;
  IF v_amount > v_due THEN RAISE EXCEPTION 'Payment exceeds supplier amount payable'; END IF;
  INSERT INTO public.payments(request_id,direction,supplier_id,amount_pence,payment_method,reference_note,created_by)
    VALUES((p_data->>'request_id')::UUID,'SUPPLIER_PAYMENT',v_supplier,v_amount,trim(p_data->>'payment_method'),NULLIF(trim(p_data->>'reference_note'),''),v_user) RETURNING id INTO v_payment;
  v_remaining := v_amount;
  FOR r IN SELECT id,invoice_number,balance_pence FROM public.purchase_invoices
    WHERE supplier_id=v_supplier AND status='FINAL' AND balance_pence>0 ORDER BY created_at
  LOOP
    EXIT WHEN v_remaining=0;
    v_apply := LEAST(v_remaining,r.balance_pence);
    UPDATE public.purchase_invoices SET paid_pence=paid_pence+v_apply,balance_pence=balance_pence-v_apply,
      payment_status=public.counter_payment_status(purchase_price_pence,paid_pence+v_apply),updated_at=now() WHERE id=r.id;
    INSERT INTO public.payment_allocations(payment_id,invoice_kind,invoice_id,amount_pence) VALUES(v_payment,'PURCHASE',r.id,v_apply);
    INSERT INTO public.supplier_ledger_entries(supplier_id,transaction_type,purchase_invoice_id,payment_id,reference,description,credit_pence,created_by)
      VALUES(v_supplier,'PAYMENT_MADE',r.id,v_payment,r.invoice_number,'Payment to supplier',v_apply,v_user);
    v_remaining := v_remaining-v_apply;
  END LOOP;
  RETURN jsonb_build_object('payment_id',v_payment,'amount_pence',v_amount);
END; $$;

CREATE OR REPLACE FUNCTION public.counter_void_invoice(p_kind TEXT, p_invoice_id UUID, p_reason TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_user UUID := public.counter_require_access(); r RECORD;
BEGIN
  IF length(trim(p_reason)) < 3 THEN RAISE EXCEPTION 'Void reason is required'; END IF;
  IF p_kind='REPAIR' THEN
    SELECT * INTO r FROM public.repair_invoices WHERE id=p_invoice_id FOR UPDATE;
    IF r.id IS NULL OR r.status='VOID' THEN RAISE EXCEPTION 'Invoice not available'; END IF;
    UPDATE public.repair_invoices SET status='VOID',void_reason=trim(p_reason),voided_at=now(),voided_by=v_user,updated_at=now() WHERE id=r.id;
    IF r.total_pence>0 THEN
      INSERT INTO public.customer_ledger_entries(customer_id,transaction_type,invoice_kind,invoice_id,reference,description,credit_pence,reason,created_by)
        VALUES(r.customer_id,'VOID_REVERSAL','REPAIR',r.id,r.invoice_number,'Voided repair invoice',r.total_pence,trim(p_reason),v_user);
    END IF;
    IF r.paid_pence>0 THEN
      INSERT INTO public.customer_ledger_entries(customer_id,transaction_type,invoice_kind,invoice_id,reference,description,debit_pence,reason,created_by)
        VALUES(r.customer_id,'CUSTOMER_REFUND','REPAIR',r.id,r.invoice_number,'Refund on voided repair',r.paid_pence,trim(p_reason),v_user);
    END IF;
  ELSIF p_kind='SALE' THEN
    SELECT * INTO r FROM public.sale_invoices WHERE id=p_invoice_id FOR UPDATE;
    IF r.id IS NULL OR r.status='VOID' THEN RAISE EXCEPTION 'Invoice not available'; END IF;
    UPDATE public.sale_invoices SET status='VOID',void_reason=trim(p_reason),voided_at=now(),voided_by=v_user,updated_at=now() WHERE id=r.id;
    UPDATE public.stock_devices SET status='IN_STOCK',sold_at=NULL,updated_at=now() WHERE id=r.stock_device_id;
    INSERT INTO public.stock_movements(stock_device_id,movement_type,reference,note,created_by) VALUES(r.stock_device_id,'SALE_VOIDED',r.invoice_number,trim(p_reason),v_user);
    IF r.total_pence>0 THEN
      INSERT INTO public.customer_ledger_entries(customer_id,transaction_type,invoice_kind,invoice_id,reference,description,credit_pence,reason,created_by)
        VALUES(r.customer_id,'VOID_REVERSAL','SALE',r.id,r.invoice_number,'Voided sale invoice',r.total_pence,trim(p_reason),v_user);
    END IF;
    IF r.paid_pence>0 THEN
      INSERT INTO public.customer_ledger_entries(customer_id,transaction_type,invoice_kind,invoice_id,reference,description,debit_pence,reason,created_by)
        VALUES(r.customer_id,'CUSTOMER_REFUND','SALE',r.id,r.invoice_number,'Refund on voided sale',r.paid_pence,trim(p_reason),v_user);
    END IF;
  ELSIF p_kind='PURCHASE' THEN
    SELECT * INTO r FROM public.purchase_invoices WHERE id=p_invoice_id FOR UPDATE;
    IF r.id IS NULL OR r.status='VOID' THEN RAISE EXCEPTION 'Invoice not available'; END IF;
    IF EXISTS(SELECT 1 FROM public.stock_devices WHERE purchase_invoice_id=r.id AND status='SOLD') THEN RAISE EXCEPTION 'Cannot void purchase: phone has already been sold'; END IF;
    UPDATE public.purchase_invoices SET status='VOID',void_reason=trim(p_reason),voided_at=now(),voided_by=v_user,updated_at=now() WHERE id=r.id;
    UPDATE public.stock_devices SET status='REMOVED',updated_at=now() WHERE purchase_invoice_id=r.id;
    INSERT INTO public.stock_movements(stock_device_id,movement_type,reference,note,created_by)
      SELECT id,'REMOVED',r.invoice_number,trim(p_reason),v_user FROM public.stock_devices WHERE purchase_invoice_id=r.id;
    IF r.purchase_price_pence>0 THEN
      INSERT INTO public.supplier_ledger_entries(supplier_id,transaction_type,purchase_invoice_id,reference,description,credit_pence,reason,created_by)
        VALUES(r.supplier_id,'VOID_REVERSAL',r.id,r.invoice_number,'Voided purchase invoice',r.purchase_price_pence,trim(p_reason),v_user);
    END IF;
    IF r.paid_pence>0 THEN
      INSERT INTO public.supplier_ledger_entries(supplier_id,transaction_type,purchase_invoice_id,reference,description,debit_pence,reason,created_by)
        VALUES(r.supplier_id,'SUPPLIER_REFUND',r.id,r.invoice_number,'Supplier refund on voided purchase',r.paid_pence,trim(p_reason),v_user);
    END IF;
  ELSE RAISE EXCEPTION 'Invalid invoice kind';
  END IF;
  RETURN jsonb_build_object('ok',true);
END; $$;

CREATE OR REPLACE FUNCTION public.counter_dashboard()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN PERFORM public.counter_require_access(); RETURN jsonb_build_object(
  'today_repairs',(SELECT count(*) FROM public.repair_invoices WHERE created_at::date=current_date AND status='FINAL'),
  'today_sales',(SELECT count(*) FROM public.sale_invoices WHERE created_at::date=current_date AND status='FINAL'),
  'in_stock',(SELECT count(*) FROM public.stock_devices WHERE status='IN_STOCK'),
  'customer_due',(SELECT COALESCE(sum(debit_pence-credit_pence),0) FROM public.customer_ledger_entries),
  'supplier_due',(SELECT COALESCE(sum(debit_pence-credit_pence),0) FROM public.supplier_ledger_entries)
); END; $$;

CREATE OR REPLACE FUNCTION public.counter_search_customers(p_query TEXT DEFAULT '')
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN PERFORM public.counter_require_access(); RETURN COALESCE((SELECT jsonb_agg(x ORDER BY x.name) FROM (
  SELECT c.id,c.name,c.phone,c.created_at,COALESCE(sum(l.debit_pence-l.credit_pence),0) balance_pence,
    COALESCE(sum(l.debit_pence) FILTER (WHERE l.transaction_type IN ('REPAIR_INVOICE','SALE_INVOICE')),0) total_invoices_pence,
    COALESCE(sum(l.credit_pence) FILTER (WHERE l.transaction_type='PAYMENT_RECEIVED'),0) total_paid_pence,
    max(l.created_at) last_activity
  FROM public.customers c LEFT JOIN public.customer_ledger_entries l ON l.customer_id=c.id
  WHERE p_query='' OR c.name ILIKE '%'||p_query||'%' OR c.phone ILIKE '%'||p_query||'%'
  GROUP BY c.id ORDER BY max(l.created_at) DESC NULLS LAST LIMIT 100
) x),'[]'::jsonb); END; $$;

CREATE OR REPLACE FUNCTION public.counter_search_suppliers(p_query TEXT DEFAULT '')
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN PERFORM public.counter_require_access(); RETURN COALESCE((SELECT jsonb_agg(x ORDER BY x.name) FROM (
  SELECT s.id,s.name,s.phone,s.id_reference,s.created_at,COALESCE(sum(l.debit_pence-l.credit_pence),0) balance_pence,
    COALESCE(sum(l.debit_pence) FILTER (WHERE l.transaction_type='PURCHASE_INVOICE'),0) total_purchases_pence,
    COALESCE(sum(l.credit_pence) FILTER (WHERE l.transaction_type='PAYMENT_MADE'),0) total_paid_pence,
    max(l.created_at) last_activity
  FROM public.suppliers s LEFT JOIN public.supplier_ledger_entries l ON l.supplier_id=s.id
  WHERE p_query='' OR s.name ILIKE '%'||p_query||'%' OR s.phone ILIKE '%'||p_query||'%'
  GROUP BY s.id ORDER BY max(l.created_at) DESC NULLS LAST LIMIT 100
) x),'[]'::jsonb); END; $$;

CREATE OR REPLACE FUNCTION public.counter_stock(p_query TEXT DEFAULT '', p_status TEXT DEFAULT 'ALL')
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN PERFORM public.counter_require_access(); RETURN COALESCE((SELECT jsonb_agg(x ORDER BY x.created_at DESC) FROM (
  SELECT id,device_make,device_model,storage,colour,imei,serial,device_condition,purchase_price_pence,expected_sale_price_pence,status,purchased_at,created_at
  FROM public.stock_devices WHERE (p_status='ALL' OR status=p_status) AND
    (p_query='' OR device_make ILIKE '%'||p_query||'%' OR device_model ILIKE '%'||p_query||'%' OR COALESCE(imei,'') ILIKE '%'||p_query||'%' OR COALESCE(serial,'') ILIKE '%'||p_query||'%')
  LIMIT 200
) x),'[]'::jsonb); END; $$;

CREATE OR REPLACE FUNCTION public.counter_invoices(p_query TEXT DEFAULT '', p_kind TEXT DEFAULT 'ALL', p_from DATE DEFAULT NULL, p_to DATE DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN PERFORM public.counter_require_access(); RETURN COALESCE((SELECT jsonb_agg(x ORDER BY x.created_at DESC) FROM (
  SELECT * FROM (
    SELECT 'REPAIR' kind,id,invoice_number,customer_name party_name,customer_phone party_phone,device_make,device_model,imei_serial identifier,total_pence,paid_pence,balance_pence,payment_status,status,created_at FROM public.repair_invoices
    UNION ALL
    SELECT 'SALE',id,invoice_number,customer_name,customer_phone,device_make,device_model,COALESCE(imei,serial),total_pence,paid_pence,balance_pence,payment_status,status,created_at FROM public.sale_invoices
    UNION ALL
    SELECT 'PURCHASE',id,invoice_number,supplier_name,supplier_phone,device_make,device_model,COALESCE(imei,serial),purchase_price_pence,paid_pence,balance_pence,payment_status,status,created_at FROM public.purchase_invoices
  ) i WHERE (p_kind='ALL' OR kind=p_kind)
    AND (p_from IS NULL OR created_at::date >= p_from)
    AND (p_to IS NULL OR created_at::date <= p_to)
    AND (p_query='' OR invoice_number ILIKE '%'||p_query||'%' OR party_name ILIKE '%'||p_query||'%' OR party_phone ILIKE '%'||p_query||'%' OR device_make ILIKE '%'||p_query||'%' OR device_model ILIKE '%'||p_query||'%' OR COALESCE(identifier,'') ILIKE '%'||p_query||'%')
  LIMIT 300
) x),'[]'::jsonb); END; $$;

CREATE OR REPLACE FUNCTION public.counter_invoice_detail(p_kind TEXT, p_invoice_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.counter_require_access();
  IF p_kind='REPAIR' THEN RETURN (SELECT to_jsonb(i) FROM public.repair_invoices i WHERE id=p_invoice_id);
  ELSIF p_kind='SALE' THEN RETURN (SELECT to_jsonb(i) FROM public.sale_invoices i WHERE id=p_invoice_id);
  ELSIF p_kind='PURCHASE' THEN RETURN (SELECT to_jsonb(i) FROM public.purchase_invoices i WHERE id=p_invoice_id);
  ELSE RAISE EXCEPTION 'Invalid invoice kind'; END IF;
END; $$;

CREATE OR REPLACE FUNCTION public.counter_customer_statement(p_customer_id UUID, p_from DATE DEFAULT NULL, p_to DATE DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN PERFORM public.counter_require_access(); RETURN jsonb_build_object(
  'party',(SELECT to_jsonb(c) FROM (SELECT id,name,phone FROM public.customers WHERE id=p_customer_id) c),
  'opening_pence',(SELECT COALESCE(sum(debit_pence-credit_pence),0) FROM public.customer_ledger_entries WHERE customer_id=p_customer_id AND p_from IS NOT NULL AND created_at::date < p_from),
  'balance_pence',(SELECT COALESCE(sum(debit_pence-credit_pence),0) FROM public.customer_ledger_entries WHERE customer_id=p_customer_id AND (p_to IS NULL OR created_at::date <= p_to)),
  'entries',COALESCE((SELECT jsonb_agg(e ORDER BY e.created_at) FROM (SELECT id,transaction_type,reference,description,debit_pence,credit_pence,reason,created_at FROM public.customer_ledger_entries WHERE customer_id=p_customer_id AND (p_from IS NULL OR created_at::date >= p_from) AND (p_to IS NULL OR created_at::date <= p_to)) e),'[]'::jsonb)
); END; $$;

CREATE OR REPLACE FUNCTION public.counter_supplier_statement(p_supplier_id UUID, p_from DATE DEFAULT NULL, p_to DATE DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN PERFORM public.counter_require_access(); RETURN jsonb_build_object(
  'party',(SELECT to_jsonb(s) FROM (SELECT id,name,phone,id_reference FROM public.suppliers WHERE id=p_supplier_id) s),
  'opening_pence',(SELECT COALESCE(sum(debit_pence-credit_pence),0) FROM public.supplier_ledger_entries WHERE supplier_id=p_supplier_id AND p_from IS NOT NULL AND created_at::date < p_from),
  'balance_pence',(SELECT COALESCE(sum(debit_pence-credit_pence),0) FROM public.supplier_ledger_entries WHERE supplier_id=p_supplier_id AND (p_to IS NULL OR created_at::date <= p_to)),
  'entries',COALESCE((SELECT jsonb_agg(e ORDER BY e.created_at) FROM (SELECT id,transaction_type,reference,description,debit_pence,credit_pence,reason,created_at FROM public.supplier_ledger_entries WHERE supplier_id=p_supplier_id AND (p_from IS NULL OR created_at::date >= p_from) AND (p_to IS NULL OR created_at::date <= p_to)) e),'[]'::jsonb)
); END; $$;

REVOKE ALL ON FUNCTION public.counter_require_access() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.counter_next_invoice_number(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.counter_create_repair(JSONB), public.counter_create_purchase(JSONB), public.counter_create_sale(JSONB),
  public.counter_receive_customer_payment(JSONB), public.counter_pay_supplier(JSONB), public.counter_void_invoice(TEXT,UUID,TEXT),
  public.counter_dashboard(), public.counter_search_customers(TEXT), public.counter_search_suppliers(TEXT), public.counter_stock(TEXT,TEXT),
  public.counter_invoices(TEXT,TEXT,DATE,DATE), public.counter_invoice_detail(TEXT,UUID), public.counter_customer_statement(UUID,DATE,DATE), public.counter_supplier_statement(UUID,DATE,DATE)
TO authenticated;
