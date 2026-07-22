import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  listAllBrandsWithModels,
  upsertBrand,
  deleteBrand,
  upsertModel,
  deleteModel,
} from "@/lib/cms.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Loader2, Plus, Pencil, Trash2, ArrowLeft, Save, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/devices")({
  head: () => ({
    meta: [{ title: "Device Models — Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: DevicesPage,
});

function DevicesPage() {
  const listFn = useServerFn(listAllBrandsWithModels);
  const upsertB = useServerFn(upsertBrand);
  const delB = useServerFn(deleteBrand);
  const upsertM = useServerFn(upsertModel);
  const delM = useServerFn(deleteModel);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ["admin", "brands"], queryFn: () => listFn() });
  const inv = () => {
    qc.invalidateQueries({ queryKey: ["admin", "brands"] });
    qc.invalidateQueries({ queryKey: ["public-brands"] });
  };

  const [openBrandId, setOpenBrandId] = useState<string | null>(null);
  const [editBrand, setEditBrand] = useState<any | null>(null);
  const [editModel, setEditModel] = useState<any | null>(null);

  const saveBrandMut = useMutation({
    mutationFn: (d: any) => upsertB({ data: d }),
    onSuccess: () => {
      toast.success("Saved");
      inv();
      setEditBrand(null);
    },
    onError: (e: any) => toast.error(e?.message ?? "Save failed"),
  });
  const delBrandMut = useMutation({
    mutationFn: (id: string) => delB({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      inv();
    },
  });
  const saveModelMut = useMutation({
    mutationFn: (d: any) => upsertM({ data: d }),
    onSuccess: () => {
      toast.success("Saved");
      inv();
      setEditModel(null);
    },
    onError: (e: any) => toast.error(e?.message ?? "Save failed"),
  });
  const delModelMut = useMutation({
    mutationFn: (id: string) => delM({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      inv();
    },
  });

  return (
    <div className="container-x py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            to="/admin"
            className="text-xs text-muted-foreground inline-flex items-center gap-1 hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Back to dashboard
          </Link>
          <h1 className="mt-1 font-display font-bold text-3xl">Device Brands &amp; Models</h1>
          <p className="text-sm text-muted-foreground">
            The booking form's brand & model dropdowns come from here.
          </p>
        </div>
        <Button onClick={() => setEditBrand({ slug: "", name: "", sort_order: 100, active: true })}>
          <Plus className="h-4 w-4 mr-2" />
          New brand
        </Button>
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-16">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-3">
          {(data ?? []).map((b: any) => (
            <Card key={b.id} className="overflow-hidden">
              <div className="p-4 flex items-center gap-3">
                <button
                  className="flex-1 text-left flex items-center gap-2"
                  onClick={() => setOpenBrandId(openBrandId === b.id ? null : b.id)}
                >
                  <ChevronRight
                    className={`h-4 w-4 transition ${openBrandId === b.id ? "rotate-90" : ""}`}
                  />
                  <span className="font-semibold">{b.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {b.models.length} models
                  </Badge>
                  {!b.active && (
                    <Badge variant="outline" className="text-xs">
                      Inactive
                    </Badge>
                  )}
                </button>
                <Button size="sm" variant="outline" onClick={() => setEditBrand(b)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() =>
                    confirm(`Delete ${b.name} and all its models?`) && delBrandMut.mutate(b.id)
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {openBrandId === b.id && (
                <div className="border-t bg-muted/30 p-4 space-y-2">
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={() =>
                        setEditModel({ brand_id: b.id, name: "", sort_order: 100, active: true })
                      }
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add model
                    </Button>
                  </div>
                  {b.models.length === 0 ? (
                    <div className="text-xs text-muted-foreground py-4 text-center">
                      No models yet.
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-2">
                      {b.models.map((m: any) => (
                        <div
                          key={m.id}
                          className="flex items-center gap-2 bg-background rounded-md px-3 py-2 border"
                        >
                          <span className="text-sm flex-1">{m.name}</span>
                          {!m.active && (
                            <Badge variant="outline" className="text-[10px]">
                              Off
                            </Badge>
                          )}
                          <Button size="icon" variant="ghost" onClick={() => setEditModel(m)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => confirm(`Delete ${m.name}?`) && delModelMut.mutate(m.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Brand editor */}
      <Sheet open={!!editBrand} onOpenChange={(o) => !o && setEditBrand(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editBrand?.id ? "Edit brand" : "New brand"}</SheetTitle>
          </SheetHeader>
          {editBrand && (
            <div className="space-y-4 mt-6">
              <div>
                <Label>Name</Label>
                <Input
                  value={editBrand.name}
                  onChange={(e) => setEditBrand({ ...editBrand, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  value={editBrand.slug}
                  onChange={(e) =>
                    setEditBrand({
                      ...editBrand,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                    })
                  }
                />
              </div>
              <div>
                <Label>Sort order</Label>
                <Input
                  type="number"
                  value={editBrand.sort_order}
                  onChange={(e) =>
                    setEditBrand({ ...editBrand, sort_order: Number(e.target.value) || 100 })
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editBrand.active}
                  onCheckedChange={(v) => setEditBrand({ ...editBrand, active: v })}
                />
                <Label>Active</Label>
              </div>
              <Button
                className="w-full"
                onClick={() => saveBrandMut.mutate(editBrand)}
                disabled={saveBrandMut.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Model editor */}
      <Sheet open={!!editModel} onOpenChange={(o) => !o && setEditModel(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editModel?.id ? "Edit model" : "New model"}</SheetTitle>
          </SheetHeader>
          {editModel && (
            <div className="space-y-4 mt-6">
              <div>
                <Label>Model name</Label>
                <Input
                  value={editModel.name}
                  onChange={(e) => setEditModel({ ...editModel, name: e.target.value })}
                  placeholder="iPhone 15 Pro"
                />
              </div>
              <div>
                <Label>Sort order</Label>
                <Input
                  type="number"
                  value={editModel.sort_order}
                  onChange={(e) =>
                    setEditModel({ ...editModel, sort_order: Number(e.target.value) || 100 })
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editModel.active}
                  onCheckedChange={(v) => setEditModel({ ...editModel, active: v })}
                />
                <Label>Active</Label>
              </div>
              <Button
                className="w-full"
                onClick={() => saveModelMut.mutate(editModel)}
                disabled={saveModelMut.isPending || !editModel.name}
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
