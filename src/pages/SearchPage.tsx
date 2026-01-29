import { useSearchParams, useNavigate } from "react-router-dom";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useCartStore } from "../stores/cartStore";

const MOCK_LISTING = {
  partNumber: "04465-0K390",
  partName: "Front Brake Pad Set – Hilux Vigo",
  vendorId: "search-vendor-1",
  vendorName: "Nairobi Genuine Parts",
  unitPrice: 7500,
  currency: "KES",
};

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const q = params.get("q") ?? "";
  const addItem = useCartStore((s) => s.addItem);

  function handleAddToCart() {
    addItem({
      ...MOCK_LISTING,
      quantity: 1,
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const nextQ = (formData.get("q") as string) ?? "";
    setParams((prev) => {
      const copy = new URLSearchParams(prev);
      if (nextQ) copy.set("q", nextQ);
      else copy.delete("q");
      return copy;
    });
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 md:flex-row md:items-center"
      >
        <Input
          name="q"
          defaultValue={q}
          placeholder="Search by part number, part name, or vehicle..."
        />
        <div className="flex gap-2 md:justify-end">
          <Button type="submit" size="sm">
            Search
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap gap-2 text-xs text-slate-700">
        <span className="font-semibold">Active filters (sample):</span>
        <Badge>Disc pads</Badge>
        <Badge variant="outline">Toyota</Badge>
        <Badge variant="outline">Nairobi vendors</Badge>
        <Badge variant="outline">Delivery &lt; 24 hrs</Badge>
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-900">
          Search results (mocked)
        </h2>
        <p className="text-xs text-slate-600">
          This screen will call your existing search endpoint and rank by exact
          part match, fitment confidence, vendor SLA, and price.
        </p>
        <div className="divide-y divide-slate-100 rounded-md border border-slate-200">
          <article className="grid gap-3 bg-white p-3 md:grid-cols-[2fr,1.5fr]">
            <div className="space-y-1">
              <p className="text-xs font-mono text-slate-500">
                OEM 04465-0K390
              </p>
              <h3 className="text-sm font-semibold text-slate-900">
                Front Brake Pad Set – Hilux Vigo
              </h3>
              <p className="text-xs text-slate-600">
                Fits Toyota Hilux Vigo 2.5/3.0D (KUN25, KUN26) 2005–2015. High
                confidence fitment.
              </p>
              <div className="flex flex-wrap gap-1 text-[11px] text-slate-600">
                <Badge variant="success">Fitment 0.96</Badge>
                <Badge variant="outline">Interchange: NIBK PN1234</Badge>
              </div>
            </div>
            <div className="flex flex-col justify-between gap-2 rounded-md bg-slate-50 p-3 text-xs">
              <div>
                <p className="font-semibold text-slate-900">From KES 7,500</p>
                <p className="text-slate-600">3 vendor offers • Nairobi</p>
                <p className="text-[11px] text-slate-500">
                  Fastest delivery: Tomorrow by 5pm
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/parts/${MOCK_LISTING.partNumber}`)}
                >
                  View offers
                </Button>
                <Button size="sm" onClick={handleAddToCart}>
                  Add to cart
                </Button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
