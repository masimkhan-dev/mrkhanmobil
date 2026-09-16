
-- ============ SITE SETTINGS (single-row key/value) ============
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_settings public read" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "site_settings admin write" ON public.site_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ SERVICES ============
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short TEXT,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'repair',
  icon TEXT DEFAULT 'Smartphone',
  price_from TEXT,
  turnaround TEXT,
  estimated_time TEXT,
  warranty TEXT DEFAULT '12-month warranty',
  features JSONB DEFAULT '[]'::jsonb,
  sort_order INT NOT NULL DEFAULT 100,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services public read active" ON public.services FOR SELECT USING (active = true);
CREATE POLICY "services staff read all" ON public.services FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));
CREATE POLICY "services admin write" ON public.services FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER services_updated BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ DEVICE BRANDS + MODELS ============
CREATE TABLE public.device_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 100,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.device_brands TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.device_brands TO authenticated;
GRANT ALL ON public.device_brands TO service_role;
ALTER TABLE public.device_brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "brands public read" ON public.device_brands FOR SELECT USING (active = true);
CREATE POLICY "brands staff read all" ON public.device_brands FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));
CREATE POLICY "brands admin write" ON public.device_brands FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER device_brands_updated BEFORE UPDATE ON public.device_brands
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.device_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES public.device_brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 100,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (brand_id, name)
);
CREATE INDEX device_models_brand_idx ON public.device_models(brand_id);
GRANT SELECT ON public.device_models TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.device_models TO authenticated;
GRANT ALL ON public.device_models TO service_role;
ALTER TABLE public.device_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "models public read" ON public.device_models FOR SELECT USING (active = true);
CREATE POLICY "models staff read all" ON public.device_models FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));
CREATE POLICY "models admin write" ON public.device_models FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER device_models_updated BEFORE UPDATE ON public.device_models
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ REPAIR TYPES ============
CREATE TABLE public.repair_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Wrench',
  sort_order INT NOT NULL DEFAULT 100,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.repair_types TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.repair_types TO authenticated;
GRANT ALL ON public.repair_types TO service_role;
ALTER TABLE public.repair_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "repair_types public read" ON public.repair_types FOR SELECT USING (active = true);
CREATE POLICY "repair_types staff read all" ON public.repair_types FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));
CREATE POLICY "repair_types admin write" ON public.repair_types FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER repair_types_updated BEFORE UPDATE ON public.repair_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ REVIEWS ============
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author TEXT NOT NULL,
  rating INT NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  body TEXT NOT NULL,
  location TEXT,
  source TEXT DEFAULT 'google',
  featured BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews public read published" ON public.reviews FOR SELECT USING (published = true);
CREATE POLICY "reviews staff read all" ON public.reviews FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));
CREATE POLICY "reviews admin write" ON public.reviews FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER reviews_updated BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ FAQS ============
CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  sort_order INT NOT NULL DEFAULT 100,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faqs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT ALL ON public.faqs TO service_role;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "faqs public read" ON public.faqs FOR SELECT USING (published = true);
CREATE POLICY "faqs staff read all" ON public.faqs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));
CREATE POLICY "faqs admin write" ON public.faqs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER faqs_updated BEFORE UPDATE ON public.faqs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ GALLERY ============
CREATE TABLE public.gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  sort_order INT NOT NULL DEFAULT 100,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.gallery_items TO authenticated;
GRANT ALL ON public.gallery_items TO service_role;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gallery public read" ON public.gallery_items FOR SELECT USING (published = true);
CREATE POLICY "gallery staff read all" ON public.gallery_items FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));
CREATE POLICY "gallery admin write" ON public.gallery_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER gallery_updated BEFORE UPDATE ON public.gallery_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ BOOKING EVENTS (timeline) ============
CREATE TABLE public.booking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX booking_events_booking_idx ON public.booking_events(booking_id, created_at DESC);
GRANT SELECT, INSERT ON public.booking_events TO authenticated;
GRANT ALL ON public.booking_events TO service_role;
ALTER TABLE public.booking_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events staff read" ON public.booking_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));
CREATE POLICY "events staff write" ON public.booking_events FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff'));

-- ============ SEED DATA ============
INSERT INTO public.site_settings (key, value) VALUES
  ('business', '{"name":"MR. KHAN","tagline":"Phones, Vapes, Accessories, Repairs & Electronics","legalName":"MR KHAN Repair Services","phone":"07707 733038","phoneRaw":"+447707733038","whatsapp":"+44 7707 733038","whatsappNumber":"447707733038","email":"Mrkhanphones500@gmail.com"}'::jsonb),
  ('address', '{"line1":"83/85 London Road, Post Office","city":"Liverpool","region":"Merseyside","postcode":"L3 8JA","country":"United Kingdom"}'::jsonb),
  ('hours', '[{"day":"Monday","hours":"9:00 – 19:00"},{"day":"Tuesday","hours":"9:00 – 19:00"},{"day":"Wednesday","hours":"9:00 – 19:00"},{"day":"Thursday","hours":"9:00 – 19:00"},{"day":"Friday","hours":"9:00 – 19:00"},{"day":"Saturday","hours":"10:00 – 18:00"},{"day":"Sunday","hours":"11:00 – 16:00"}]'::jsonb),
  ('social', '{"facebook":"https://facebook.com/mr.khan.phones","instagram":"https://instagram.com/mr.khan.phones","tiktok":"https://tiktok.com/","google":"https://g.page/"}'::jsonb),
  ('branding', '{"logoUrl":"","faviconUrl":"","primaryColor":""}'::jsonb),
  ('analytics', '{"gaId":"","gtmId":"","metaPixelId":""}'::jsonb),
  ('announcement', '{"enabled":false,"text":"","link":""}'::jsonb);

-- Seed brands
INSERT INTO public.device_brands (slug, name, sort_order) VALUES
  ('apple','Apple',10),('samsung','Samsung',20),('google','Google',30),
  ('huawei','Huawei',40),('xiaomi','Xiaomi',50),('oppo','Oppo',60),
  ('oneplus','OnePlus',70),('honor','Honor',80),('sony','Sony',90),
  ('nokia','Nokia',100),('motorola','Motorola',110);

-- Seed models
WITH b AS (SELECT id, slug FROM public.device_brands)
INSERT INTO public.device_models (brand_id, name, sort_order)
SELECT b.id, m.name, m.sort_order FROM b JOIN (VALUES
  ('apple','iPhone 15 Pro Max',10),('apple','iPhone 15 Pro',20),('apple','iPhone 15 Plus',30),('apple','iPhone 15',40),
  ('apple','iPhone 14 Pro Max',50),('apple','iPhone 14 Pro',60),('apple','iPhone 14 Plus',70),('apple','iPhone 14',80),
  ('apple','iPhone 13 Pro Max',90),('apple','iPhone 13 Pro',100),('apple','iPhone 13',110),('apple','iPhone 13 mini',120),
  ('apple','iPhone 12 Pro Max',130),('apple','iPhone 12 Pro',140),('apple','iPhone 12',150),('apple','iPhone 12 mini',160),
  ('apple','iPhone 11 Pro Max',170),('apple','iPhone 11 Pro',180),('apple','iPhone 11',190),
  ('apple','iPhone XS Max',200),('apple','iPhone XS',210),('apple','iPhone XR',220),('apple','iPhone X',230),
  ('apple','iPhone SE (2022)',240),('apple','iPhone SE (2020)',250),
  ('samsung','Galaxy S24 Ultra',10),('samsung','Galaxy S24+',20),('samsung','Galaxy S24',30),
  ('samsung','Galaxy S23 Ultra',40),('samsung','Galaxy S23+',50),('samsung','Galaxy S23',60),
  ('samsung','Galaxy S22 Ultra',70),('samsung','Galaxy S22+',80),('samsung','Galaxy S22',90),
  ('samsung','Galaxy S21 Ultra',100),('samsung','Galaxy S21+',110),('samsung','Galaxy S21',120),
  ('samsung','Galaxy Z Fold 5',130),('samsung','Galaxy Z Fold 4',140),('samsung','Galaxy Z Flip 5',150),('samsung','Galaxy Z Flip 4',160),
  ('samsung','Galaxy Note 20 Ultra',170),('samsung','Galaxy Note 20',180),
  ('samsung','Galaxy A54',190),('samsung','Galaxy A34',200),('samsung','Galaxy A14',210),
  ('google','Pixel 8 Pro',10),('google','Pixel 8',20),('google','Pixel 7 Pro',30),('google','Pixel 7',40),
  ('google','Pixel 6 Pro',50),('google','Pixel 6',60),('google','Pixel 5',70),('google','Pixel 4a',80),
  ('huawei','P60 Pro',10),('huawei','P50 Pro',20),('huawei','P40 Pro',30),('huawei','Mate 50 Pro',40),
  ('xiaomi','13 Pro',10),('xiaomi','13',20),('xiaomi','12 Pro',30),('xiaomi','Redmi Note 12',40),('xiaomi','Poco F5',50),
  ('oppo','Find X6 Pro',10),('oppo','Reno 10',20),('oppo','A98',30),
  ('oneplus','12',10),('oneplus','11',20),('oneplus','10 Pro',30),('oneplus','Nord 3',40),
  ('honor','Magic 5 Pro',10),('honor','90',20),
  ('sony','Xperia 1 V',10),('sony','Xperia 5 IV',20),
  ('nokia','G22',10),('nokia','X30',20),
  ('motorola','Edge 40',10),('motorola','Razr 40',20)
) AS m(brand_slug, name, sort_order) ON b.slug = m.brand_slug;

-- Seed repair types
INSERT INTO public.repair_types (slug, name, description, icon, sort_order) VALUES
  ('screen-repair','Screen Repair','Cracked, black, or unresponsive screen','Smartphone',10),
  ('battery-replacement','Battery Replacement','Poor battery life or swelling','Battery',20),
  ('charging-port','Charging Port Repair','Won''t charge or loose port','Zap',30),
  ('camera-repair','Camera Repair','Blurry, cracked or dead camera','Camera',40),
  ('speaker-repair','Speaker Repair','No sound or muffled audio','Volume2',50),
  ('microphone-repair','Microphone Repair','Callers can''t hear you','Mic',60),
  ('back-glass','Back Glass Repair','Cracked back panel','ScanLine',70),
  ('water-damage','Water Damage','Liquid damaged device','Droplets',80),
  ('software-issue','Software Issue','Boot loop, iOS/Android errors','Cpu',90),
  ('data-recovery','Data Recovery','Recover photos, contacts, messages','HardDrive',100),
  ('other','Other','Something else — we''ll diagnose','Wrench',110);

-- Seed services (mirroring existing static config)
INSERT INTO public.services (slug, title, short, description, category, icon, price_from, turnaround, estimated_time, warranty, features, sort_order) VALUES
  ('iphone-repair','iPhone Repair','All iPhone models — same-day','Expert iPhone repair from iPhone 6 through iPhone 15 Pro Max. Screens, batteries, cameras, charging ports, back glass and logic-board level work.','device','Smartphone','£29','30 min – 2 hrs','Same day','12-month warranty','["Genuine-grade parts","12-month warranty","Same-day for most repairs","No fix, no fee"]'::jsonb,10),
  ('samsung-repair','Samsung Repair','Galaxy S, Note, A, Z Fold/Flip','Full Samsung Galaxy repair coverage including foldables. Screen replacement, battery, charging port, cameras and water damage recovery.','device','Smartphone','£35','1 – 3 hrs','Same day','12-month warranty','["OLED-grade panels","12-month warranty","Fold & Flip specialists","Data preserved"]'::jsonb,20),
  ('google-pixel-repair','Google Pixel Repair','Pixel 3 through Pixel 8 Pro','Google Pixel screen, battery, camera and charging repairs by certified technicians.','device','Smartphone','£45','1 – 3 hrs','Same day','12-month warranty','["OEM-quality parts","12-month warranty","Fingerprint recalibration","Free diagnostic"]'::jsonb,30),
  ('screen-replacement','Screen Replacement','Cracked or dead display','Cracked screen, black screen, dead pixels or unresponsive touch — fixed with OLED/AMOLED-grade replacement panels.','repair','Smartphone','£29','30 min – 2 hrs','30–60 min','12-month warranty','["OEM-quality panels","12-month warranty","True-tone re-calibration"]'::jsonb,110),
  ('battery-replacement','Battery Replacement','Restore all-day battery life','High-grade replacement batteries fitted while you wait for iPhone, Samsung and all major Android phones.','repair','Battery','£29','30 – 60 min','30 min','12-month warranty','["Health-tested cells","12-month warranty","Fitted while you wait"]'::jsonb,120),
  ('charging-port','Charging Port Repair','Won''t charge or loose port','Micro-soldered charging port repair — deep clean, connector replacement or full port assembly swap.','repair','Zap','£35','1 – 2 hrs','1–2 hrs','12-month warranty','["Micro-solder repair","12-month warranty","Deep clean included"]'::jsonb,130),
  ('camera-repair','Camera Repair','Blurry or dead camera','Rear, front and ultra-wide camera module replacement. Auto-focus, lens and flex-cable repair.','repair','Camera','£39','1 – 2 hrs','1–2 hrs','12-month warranty','["OEM modules","12-month warranty","Test shot verification"]'::jsonb,140),
  ('water-damage','Water Damage Repair','Liquid-damaged device rescue','Ultrasonic board cleaning and component-level rework to recover water-damaged devices. Free diagnostic.','repair','Droplets','£45','24 – 72 hrs','24–72 hrs','No fix, no fee','["Ultrasonic clean","Data recovery","No fix, no fee"]'::jsonb,150),
  ('back-glass','Back Glass Repair','iPhone & Samsung back covers','Laser-precision back glass removal and replacement — colour-matched and adhesive-sealed.','repair','ScanLine','£39','1 – 3 hrs','1–3 hrs','12-month warranty','["Colour-matched","12-month warranty","Wireless-charge tested"]'::jsonb,160);

-- Seed reviews
INSERT INTO public.reviews (author, rating, body, location, source, featured, sort_order) VALUES
  ('Luan Delacruz',5,'Amazing service front screen fixed in 20 minutes for cheap and even cleaned my camera for me without me having to ask! Amazing results thankyou','Liverpool','google',true,10),
  ('Tyren Devine',5,'Amazing service, quick and easy and best prices going, best friendly staff anywhere in liverpool! highly recommend !!','Liverpool','google',true,20),
  ('Sehrish Kabir',5,'Highly recommended very good and fast service and reasonable prices and quality products 💯💯❤️','Liverpool','google',true,30),
  ('Vinay kumar',5,'Good quality ..expert repair','Liverpool','google',true,40),
  ('Thu San',5,'Great service. Get the screen protection done for my tablet quickly.','Liverpool','google',true,50),
  ('Zion Edwards',5,'Good and honest man, fast and cheap service.','Liverpool','google',false,60),
  ('Milazim Beqa',5,'Amazing owner, lovely place','Liverpool','google',false,70),
  ('Muhammad Asim Khan',5,'Well professional staff for each and everything. The services that they provide, highly recommend.','Liverpool','google',false,80);

-- Seed FAQs
INSERT INTO public.faqs (question, answer, category, sort_order) VALUES
  ('How long does a phone repair take?','Most screen and battery repairs are completed in 30 minutes to 2 hours. Complex issues like water damage or motherboard repair can take 24–72 hours. We''ll give you an accurate ETA before starting.','general',10),
  ('Do you use genuine parts?','We use genuine-grade OEM parts for all repairs. For iPhones we also offer genuine Apple parts on request (subject to availability and price).','parts',20),
  ('Is there a warranty?','Yes — every repair includes our 12-month warranty covering the replaced part and workmanship. Water damage is covered by our "no fix, no fee" policy.','warranty',30),
  ('Do you offer home visits?','Yes, we offer home visit repairs across Liverpool, Manchester, Wirral and surrounding areas. Book online and choose "Home Visit" as your service type.','service',40),
  ('Can I mail my device in?','Absolutely. Post it insured to our address (we''ll email you the label option), we diagnose, quote, repair and return via next-day tracked delivery.','service',50),
  ('Will I lose my data?','No — we never wipe your device. For software repairs we always back up first where possible. For data recovery from dead devices we operate on a no-data-no-fee basis.','data',60),
  ('How do I pay?','Cash, all major debit/credit cards, Apple Pay, Google Pay and bank transfer. Payment is only taken once the repair is complete and tested.','payment',70),
  ('What if you can''t fix my phone?','Our "No fix, no fee" guarantee means if we can''t repair your device, you pay nothing. Simple.','warranty',80);
