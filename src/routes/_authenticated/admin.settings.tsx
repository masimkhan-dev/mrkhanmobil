import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { getAllSiteSettings, updateSiteSetting } from "@/lib/cms.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Loader2, Save, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => ({
    meta: [{ title: "Site Settings — Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const getFn = useServerFn(getAllSiteSettings);
  const setFn = useServerFn(updateSiteSetting);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ["admin", "settings"], queryFn: () => getFn() });
  const mut = useMutation({
    mutationFn: (p: { key: string; value: any }) => setFn({ data: p }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin", "settings"] });
      qc.invalidateQueries({ queryKey: ["public-site-settings"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Save failed"),
  });

  const [business, setBusiness] = useState<any>(null);
  const [address, setAddress] = useState<any>(null);
  const [hours, setHours] = useState<any[]>([]);
  const [social, setSocial] = useState<any>(null);
  const [branding, setBranding] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [announcement, setAnnouncement] = useState<any>(null);

  // Initialise local form state once the server data has loaded.
  // useEffect is the correct place to call setState in response to a prop/query
  // change — calling setState during render is a React anti-pattern that causes
  // a double-render and a warning in Strict Mode.
  useEffect(() => {
    if (!data) return;
    setBusiness(data.business ?? {});
    setAddress(data.address ?? {});
    setHours(data.hours ?? []);
    setSocial(data.social ?? {});
    setBranding(data.branding ?? {});
    setAnalytics(data.analytics ?? {});
    setAnnouncement(data.announcement ?? {});
  }, [data]);

  if (isLoading || !business) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const saveKey = (key: string, value: any) => mut.mutate({ key, value });

  return (
    <div className="container-x py-8 space-y-6 max-w-4xl">
      <div>
        <Link
          to="/admin"
          className="text-xs text-muted-foreground inline-flex items-center gap-1 hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Back to dashboard
        </Link>
        <h1 className="mt-1 font-display font-bold text-3xl">Site Settings</h1>
        <p className="text-sm text-muted-foreground">
          Business details, branding, analytics and announcement bar.
        </p>
      </div>

      {/* BUSINESS */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Business Details</h2>
          <Button size="sm" onClick={() => saveKey("business", business)} disabled={mut.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="Business name"
            value={business.name}
            onChange={(v) => setBusiness({ ...business, name: v })}
          />
          <Field
            label="Tagline"
            value={business.tagline}
            onChange={(v) => setBusiness({ ...business, tagline: v })}
          />
          <Field
            label="Legal name"
            value={business.legalName}
            onChange={(v) => setBusiness({ ...business, legalName: v })}
          />
          <Field
            label="Email"
            value={business.email}
            onChange={(v) => setBusiness({ ...business, email: v })}
          />
          <Field
            label="Phone (display)"
            value={business.phone}
            onChange={(v) => setBusiness({ ...business, phone: v })}
          />
          <Field
            label="Phone (dial, +44...)"
            value={business.phoneRaw}
            onChange={(v) => setBusiness({ ...business, phoneRaw: v })}
          />
          <Field
            label="WhatsApp (display)"
            value={business.whatsapp}
            onChange={(v) => setBusiness({ ...business, whatsapp: v })}
          />
          <Field
            label="WhatsApp (number only, 447...)"
            value={business.whatsappNumber}
            onChange={(v) => setBusiness({ ...business, whatsappNumber: v })}
          />
        </div>
      </Card>

      {/* ADDRESS */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Address</h2>
          <Button size="sm" onClick={() => saveKey("address", address)} disabled={mut.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="Street"
            value={address.line1}
            onChange={(v) => setAddress({ ...address, line1: v })}
          />
          <Field
            label="City"
            value={address.city}
            onChange={(v) => setAddress({ ...address, city: v })}
          />
          <Field
            label="Region"
            value={address.region}
            onChange={(v) => setAddress({ ...address, region: v })}
          />
          <Field
            label="Postcode"
            value={address.postcode}
            onChange={(v) => setAddress({ ...address, postcode: v })}
          />
          <Field
            label="Country"
            value={address.country}
            onChange={(v) => setAddress({ ...address, country: v })}
          />
        </div>
      </Card>

      {/* HOURS */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Opening Hours</h2>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setHours([...hours, { day: "New", hours: "9:00 – 17:00" }])}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
            <Button size="sm" onClick={() => saveKey("hours", hours)} disabled={mut.isPending}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          {hours.map((h, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={h.day}
                onChange={(e) => {
                  const c = [...hours];
                  c[i] = { ...c[i], day: e.target.value };
                  setHours(c);
                }}
                placeholder="Day"
              />
              <Input
                value={h.hours}
                onChange={(e) => {
                  const c = [...hours];
                  c[i] = { ...c[i], hours: e.target.value };
                  setHours(c);
                }}
                placeholder="9:00 – 19:00"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setHours(hours.filter((_, j) => j !== i))}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* BRANDING */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Branding</h2>
          <Button size="sm" onClick={() => saveKey("branding", branding)} disabled={mut.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="Logo URL"
            value={branding.logoUrl}
            onChange={(v) => setBranding({ ...branding, logoUrl: v })}
            placeholder="https://…"
          />
          <Field
            label="Favicon URL"
            value={branding.faviconUrl}
            onChange={(v) => setBranding({ ...branding, faviconUrl: v })}
            placeholder="https://…"
          />
        </div>
        {branding.logoUrl && (
          <img src={branding.logoUrl} alt="Logo preview" className="h-12 mt-2" />
        )}
      </Card>

      {/* SOCIAL */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Social Links</h2>
          <Button size="sm" onClick={() => saveKey("social", social)} disabled={mut.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="Facebook"
            value={social.facebook}
            onChange={(v) => setSocial({ ...social, facebook: v })}
          />
          <Field
            label="Instagram"
            value={social.instagram}
            onChange={(v) => setSocial({ ...social, instagram: v })}
          />
          <Field
            label="TikTok"
            value={social.tiktok}
            onChange={(v) => setSocial({ ...social, tiktok: v })}
          />
          <Field
            label="Google Business"
            value={social.google}
            onChange={(v) => setSocial({ ...social, google: v })}
          />
        </div>
      </Card>

      {/* ANALYTICS */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Analytics</h2>
          <Button
            size="sm"
            onClick={() => saveKey("analytics", analytics)}
            disabled={mut.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field
            label="Google Analytics ID"
            value={analytics.gaId}
            onChange={(v) => setAnalytics({ ...analytics, gaId: v })}
            placeholder="G-XXXXXXX"
          />
          <Field
            label="Google Tag Manager"
            value={analytics.gtmId}
            onChange={(v) => setAnalytics({ ...analytics, gtmId: v })}
            placeholder="GTM-XXXXXX"
          />
          <Field
            label="Meta Pixel ID"
            value={analytics.metaPixelId}
            onChange={(v) => setAnalytics({ ...analytics, metaPixelId: v })}
          />
        </div>
      </Card>

      {/* ANNOUNCEMENT */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Announcement Bar</h2>
          <Button
            size="sm"
            onClick={() => saveKey("announcement", announcement)}
            disabled={mut.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            checked={!!announcement.enabled}
            onCheckedChange={(v) => setAnnouncement({ ...announcement, enabled: v })}
          />
          <Label>Show announcement bar on top of every page</Label>
        </div>
        <Field
          label="Text"
          value={announcement.text}
          onChange={(v) => setAnnouncement({ ...announcement, text: v })}
          placeholder="Same-day iPhone screen repair from £29"
        />
        <Field
          label="Link (optional)"
          value={announcement.link}
          onChange={(v) => setAnnouncement({ ...announcement, link: v })}
          placeholder="/book"
        />
      </Card>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string | undefined;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
