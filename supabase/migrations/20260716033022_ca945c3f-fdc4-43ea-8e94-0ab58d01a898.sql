
-- Enum for booking status
CREATE TYPE public.booking_status AS ENUM (
  'pending','diagnosing','repair_started','waiting_parts','completed','ready_for_collection','delivered','cancelled'
);

CREATE TYPE public.service_type AS ENUM ('walk_in','home_visit','mail_in');

-- BOOKINGS
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_ref TEXT NOT NULL UNIQUE,
  device_type TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  problem TEXT NOT NULL,
  service_type public.service_type NOT NULL DEFAULT 'walk_in',
  preferred_date DATE,
  preferred_time TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  postcode TEXT,
  city TEXT,
  notes TEXT,
  status public.booking_status NOT NULL DEFAULT 'pending',
  status_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.bookings TO anon, authenticated;
GRANT ALL ON public.bookings TO service_role;

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create a booking"
  ON public.bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- LEADS
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  message TEXT,
  source TEXT NOT NULL DEFAULT 'contact_form',
  device TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.leads TO anon, authenticated;
GRANT ALL ON public.leads TO service_role;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a lead"
  ON public.leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- NEWSLETTER
CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.newsletter_subscribers TO anon, authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe"
  ON public.newsletter_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX bookings_created_at_idx ON public.bookings (created_at DESC);
CREATE INDEX bookings_status_idx ON public.bookings (status);
CREATE INDEX leads_created_at_idx ON public.leads (created_at DESC);
