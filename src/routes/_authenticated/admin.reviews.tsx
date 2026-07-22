import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listAdminReviews, upsertReview, deleteReview } from "@/lib/cms.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Loader2, Plus, Pencil, Trash2, ArrowLeft, Save, Star } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/reviews")({
  head: () => ({ meta: [{ title: "Reviews — Admin" }, { name: "robots", content: "noindex" }] }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const listFn = useServerFn(listAdminReviews);
  const upsertFn = useServerFn(upsertReview);
  const delFn = useServerFn(deleteReview);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ["admin", "reviews"], queryFn: () => listFn() });
  const [editing, setEditing] = useState<any | null>(null);

  const saveMut = useMutation({
    mutationFn: (d: any) => upsertFn({ data: d }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
      qc.invalidateQueries({ queryKey: ["public-reviews"] });
      setEditing(null);
    },
  });
  const delMut = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
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
          <h1 className="mt-1 font-display font-bold text-3xl">Reviews</h1>
          <p className="text-sm text-muted-foreground">Customer testimonials shown on the site.</p>
        </div>
        <Button
          onClick={() =>
            setEditing({
              author: "",
              rating: 5,
              body: "",
              location: "",
              source: "google",
              featured: false,
              published: true,
              sort_order: 100,
            })
          }
        >
          <Plus className="h-4 w-4 mr-2" />
          New review
        </Button>
      </div>

      <div className="grid gap-3">
        {isLoading ? (
          <div className="grid place-items-center py-16">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          (data ?? []).map((r: any) => (
            <Card key={r.id} className="p-4 flex flex-wrap items-start gap-4">
              <div className="flex-1 min-w-[240px]">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{r.author}</div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  {r.featured && (
                    <Badge
                      className="bg-accent/15 text-accent border-accent/30 text-xs"
                      variant="secondary"
                    >
                      Featured
                    </Badge>
                  )}
                  {!r.published && (
                    <Badge variant="outline" className="text-xs">
                      Draft
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{r.body}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {r.location} · {r.source}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditing(r)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => confirm("Delete this review?") && delMut.mutate(r.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editing?.id ? "Edit review" : "New review"}</SheetTitle>
          </SheetHeader>
          {editing && (
            <div className="space-y-4 mt-6">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label>Author</Label>
                  <Input
                    value={editing.author}
                    onChange={(e) => setEditing({ ...editing, author: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={editing.location ?? ""}
                    onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                    placeholder="Liverpool"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label>Rating (1–5)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={editing.rating}
                    onChange={(e) =>
                      setEditing({ ...editing, rating: Number(e.target.value) || 5 })
                    }
                  />
                </div>
                <div>
                  <Label>Source</Label>
                  <Input
                    value={editing.source}
                    onChange={(e) => setEditing({ ...editing, source: e.target.value })}
                    placeholder="google"
                  />
                </div>
              </div>
              <div>
                <Label>Review body</Label>
                <Textarea
                  rows={5}
                  value={editing.body}
                  onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                />
              </div>
              <div>
                <Label>Sort order</Label>
                <Input
                  type="number"
                  value={editing.sort_order}
                  onChange={(e) =>
                    setEditing({ ...editing, sort_order: Number(e.target.value) || 100 })
                  }
                />
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editing.featured}
                    onCheckedChange={(v) => setEditing({ ...editing, featured: v })}
                  />
                  <Label>Featured</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editing.published}
                    onCheckedChange={(v) => setEditing({ ...editing, published: v })}
                  />
                  <Label>Published</Label>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => saveMut.mutate(editing)}
                disabled={saveMut.isPending || !editing.author || !editing.body}
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
