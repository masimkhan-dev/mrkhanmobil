-- Migration: 20260822000000_counter_parties.sql
-- Dedicated SECURITY DEFINER RPCs for direct customer and supplier account creation.
-- Concurrency-safe atomic insertion with ON CONFLICT DO NOTHING, defensive validation,
-- non-destructive field merging, and exact persisted row return with an explicit 'existing' flag.

-- 1. Support both service_role (server functions) and authenticated staff/admin users in counter access check
CREATE OR REPLACE FUNCTION public.counter_require_access()
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user UUID := auth.uid();
  v_role TEXT := auth.role();
  v_admin UUID;
BEGIN
  -- 1. If called by server function via service_role, resolve to authenticated user or first registered admin
  IF v_role = 'service_role' OR v_user IS NULL THEN
    IF v_user IS NOT NULL THEN
      RETURN v_user;
    END IF;
    SELECT user_id INTO v_admin FROM public.user_roles WHERE role = 'admin' LIMIT 1;
    IF v_admin IS NULL THEN
      SELECT id INTO v_admin FROM auth.users ORDER BY created_at ASC LIMIT 1;
    END IF;
    IF v_admin IS NOT NULL THEN
      RETURN v_admin;
    END IF;
  END IF;

  -- 2. Verify authenticated user has admin or staff role
  IF v_user IS NULL OR NOT (public.has_role(v_user, 'admin') OR public.has_role(v_user, 'staff')) THEN
    RAISE EXCEPTION 'Forbidden: counter access required';
  END IF;
  RETURN v_user;
END; $$;

REVOKE ALL ON FUNCTION public.counter_require_access() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.counter_require_access() TO authenticated, service_role;

-- 2. Standalone Customer Creation RPC
CREATE OR REPLACE FUNCTION public.counter_create_customer(p_data JSONB)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user UUID := public.counter_require_access();
  v_name TEXT := NULLIF(trim(COALESCE(p_data->>'name', '')), '');
  v_phone TEXT := NULLIF(trim(COALESCE(p_data->>'phone', '')), '');
  v_note TEXT := NULLIF(trim(COALESCE(p_data->>'note', '')), '');
  v_row public.customers%ROWTYPE;
  v_is_existing BOOLEAN := false;
BEGIN
  IF v_name IS NULL THEN RAISE EXCEPTION 'Customer name is required'; END IF;
  IF v_phone IS NULL OR length(v_phone) < 6 THEN RAISE EXCEPTION 'Phone number must be at least 6 characters'; END IF;

  -- Atomic insertion attempt (handles concurrent requests cleanly)
  INSERT INTO public.customers(name, phone, note)
  VALUES(v_name, v_phone, v_note)
  ON CONFLICT ((lower(trim(phone)))) DO NOTHING
  RETURNING * INTO v_row;

  -- If conflict occurred, safely retrieve and merge non-destructively
  IF v_row.id IS NULL THEN
    v_is_existing := true;

    SELECT * INTO v_row
    FROM public.customers
    WHERE lower(trim(phone)) = lower(v_phone)
    LIMIT 1;

    -- Only backfill note if previous was NULL and new is provided (never overwrite existing name)
    IF v_row.note IS NULL AND v_note IS NOT NULL THEN
      UPDATE public.customers
      SET note = v_note,
          updated_at = now()
      WHERE id = v_row.id
      RETURNING * INTO v_row;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'id', v_row.id,
    'name', v_row.name,
    'phone', v_row.phone,
    'note', v_row.note,
    'existing', v_is_existing
  );
END; $$;

-- 3. Standalone Supplier Creation RPC
CREATE OR REPLACE FUNCTION public.counter_create_supplier(p_data JSONB)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user UUID := public.counter_require_access();
  v_name TEXT := NULLIF(trim(COALESCE(p_data->>'name', '')), '');
  v_phone TEXT := NULLIF(trim(COALESCE(p_data->>'phone', '')), '');
  v_id_ref TEXT := NULLIF(trim(COALESCE(p_data->>'id_reference', '')), '');
  v_note TEXT := NULLIF(trim(COALESCE(p_data->>'note', '')), '');
  v_row public.suppliers%ROWTYPE;
  v_is_existing BOOLEAN := false;
BEGIN
  IF v_name IS NULL THEN RAISE EXCEPTION 'Supplier name is required'; END IF;
  IF v_phone IS NULL OR length(v_phone) < 6 THEN RAISE EXCEPTION 'Phone number must be at least 6 characters'; END IF;

  -- Atomic insertion attempt (handles concurrent requests cleanly)
  INSERT INTO public.suppliers(name, phone, id_reference, note)
  VALUES(v_name, v_phone, v_id_ref, v_note)
  ON CONFLICT ((lower(trim(phone)))) DO NOTHING
  RETURNING * INTO v_row;

  -- If conflict occurred, safely retrieve and merge non-destructively
  IF v_row.id IS NULL THEN
    v_is_existing := true;

    SELECT * INTO v_row
    FROM public.suppliers
    WHERE lower(trim(phone)) = lower(v_phone)
    LIMIT 1;

    -- Preserve existing values; only fill missing optional fields
    IF (v_row.id_reference IS NULL AND v_id_ref IS NOT NULL) OR (v_row.note IS NULL AND v_note IS NOT NULL) THEN
      UPDATE public.suppliers
      SET id_reference = COALESCE(v_row.id_reference, v_id_ref),
          note = COALESCE(v_row.note, v_note),
          updated_at = now()
      WHERE id = v_row.id
      RETURNING * INTO v_row;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'id', v_row.id,
    'name', v_row.name,
    'phone', v_row.phone,
    'id_reference', v_row.id_reference,
    'note', v_row.note,
    'existing', v_is_existing
  );
END; $$;

REVOKE ALL ON FUNCTION public.counter_create_customer(JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.counter_create_supplier(JSONB) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.counter_create_customer(JSONB) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.counter_create_supplier(JSONB) TO authenticated, service_role;
