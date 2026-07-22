
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.city_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  postcodes TEXT NOT NULL DEFAULT '',
  intro TEXT NOT NULL DEFAULT '',
  meta_title TEXT NOT NULL DEFAULT '',
  meta_description TEXT NOT NULL DEFAULT '',
  h1 TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  published BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT city_pages_slug_not_empty CHECK (length(trim(slug)) > 0)
);

GRANT SELECT ON public.city_pages TO anon;
GRANT SELECT ON public.city_pages TO authenticated;
GRANT ALL ON public.city_pages TO service_role;

ALTER TABLE public.city_pages ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_city_pages_slug ON public.city_pages(slug);
CREATE INDEX idx_city_pages_published ON public.city_pages(published);
CREATE INDEX idx_city_pages_sort_order ON public.city_pages(sort_order);
CREATE INDEX idx_city_pages_name ON public.city_pages(name);

CREATE POLICY "Public can view published city pages"
  ON public.city_pages FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can view all city pages"
  ON public.city_pages FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert city pages"
  ON public.city_pages FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update city pages"
  ON public.city_pages FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete city pages"
  ON public.city_pages FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_city_pages_updated_at
  BEFORE UPDATE ON public.city_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.city_pages (slug, name, postcodes, intro, meta_title, meta_description, h1, body, sort_order) VALUES
('liverpool','Liverpool','L1 – L36','Same-day mobile phone repair for Liverpool city centre and surrounding areas.',
 'Mobile Phone Repair Liverpool | Same-Day iPhone & Samsung | MR KHAN',
 'Same-day mobile phone repair in Liverpool. iPhone, Samsung, Google Pixel & Android screen, battery & charging port repair with a 12-month warranty.',
 'Mobile Phone Repair in Liverpool',
 'MR KHAN is Liverpool''s trusted mobile phone repair specialist. We fix cracked screens, dead batteries, charging ports, cameras and water-damaged phones across L1–L36 — often same day.',
 1),
('manchester','Manchester','M1 – M46','Trusted Manchester phone repair experts — walk-in, home visit or mail-in service.',
 'Mobile Phone Repair Manchester | iPhone, Samsung & Android | MR KHAN',
 'Fast, warrantied mobile phone repair in Manchester. Screen, battery and charging port repair — same-day where possible.',
 'Mobile Phone Repair in Manchester',
 'Cracked your phone in Manchester? MR KHAN offers same-day iPhone, Samsung and Android repair across M1–M46 with a 12-month warranty.',
 2),
('bootle','Bootle','L20 – L30','Bootle''s local phone repair specialists — fast turnaround, warranty on every repair.',
 'Mobile Phone Repair Bootle | Same-Day iPhone & Samsung | MR KHAN',
 'Local phone repair in Bootle L20–L30. Same-day iPhone, Samsung and Android screen and battery repair with a 12-month warranty.',
 'Mobile Phone Repair in Bootle',
 'MR KHAN is Bootle''s go-to phone repair shop. Fast, honest, warrantied repairs for every major phone brand.',
 3),
('wirral','Wirral','CH41 – CH66','Home and mail-in phone repair across the Wirral peninsula.',
 'Mobile Phone Repair Wirral | Home Visit & Mail-In | MR KHAN',
 'Wirral phone repair CH41–CH66. Screen, battery and charging port repair with home visits or free mail-in. 12-month warranty.',
 'Mobile Phone Repair on the Wirral',
 'We cover the whole Wirral peninsula — from Birkenhead to Heswall. Book a home visit or send your phone in with our free tracked mail-in service.',
 4),
('st-helens','St Helens','WA9 – WA12','St Helens phone repair — same-day service with a real 12-month warranty.',
 'Mobile Phone Repair St Helens | Same-Day iPhone & Samsung | MR KHAN',
 'St Helens WA9–WA12 mobile phone repair. Screen, battery, charging port and water-damage repair — same day where possible.',
 'Mobile Phone Repair in St Helens',
 'MR KHAN fixes phones across St Helens — quickly, honestly, and with a 12-month warranty on every repair.',
 5),
('southport','Southport','PR8 – PR9','Repair collection and mail-in service across Southport — free UK-wide return delivery.',
 'Mobile Phone Repair Southport | Free Collection & Mail-In | MR KHAN',
 'Southport PR8–PR9 phone repair. Free collection, mail-in and return delivery with a 12-month warranty.',
 'Mobile Phone Repair in Southport',
 'We collect and return your phone anywhere in Southport, or send it in with our free tracked mail-in service.',
 6),
('birkenhead','Birkenhead','CH41 – CH43','Birkenhead''s premier phone repair service — walk-in, home visit or courier collection.',
 'Mobile Phone Repair Birkenhead | iPhone & Samsung Repair | MR KHAN',
 'Birkenhead CH41–CH43 mobile phone repair. Same-day iPhone, Samsung and Android screen and battery repair with a 12-month warranty.',
 'Mobile Phone Repair in Birkenhead',
 'MR KHAN serves Birkenhead with fast, honest, warrantied phone repair — walk-in or home visit.',
 7);
