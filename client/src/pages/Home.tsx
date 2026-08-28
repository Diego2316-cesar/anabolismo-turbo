import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  ChevronDown,
  Grid2X2,
  List,
  Menu,
  MessageCircle,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";

const LOGO_URL = "https://xsveypccptxvpiygbnqv.supabase.co/storage/v1/object/public/catalog-images/anabolismo-turbo-logo-novo.png";
const WHATSAPP_NUMBER = "5519994699667";

type SortOption = "category" | "lowest" | "highest" | "az" | "za";
type LayoutOption = "grid" | "list";

function formatPrice(priceCents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(priceCents / 100);
}

function ProductCard({
  product,
  layout,
}: {
  product: {
    id: string;
    name: string;
    price_cents: number;
    image_url: string | null;
  };
  layout: LayoutOption;
}) {
  const [, setLocation] = useLocation();
  const isList = layout === "list";
  const openProduct = () => setLocation(`/produto/${product.id}`);

  return (
    <article
      className={
        isList
          ? "group flex cursor-pointer items-center gap-5 border-b border-black/10 bg-white px-0 py-5 transition-colors hover:bg-black/[0.02] focus-within:bg-black/[0.02]"
          : "group cursor-pointer overflow-hidden rounded-[2px] border border-black/10 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-[#c89518] hover:shadow-[0_14px_35px_rgba(0,0,0,0.12)]"
      }
      title={`Abrir ${product.name}`}
      role="link"
      tabIndex={0}
      onClick={openProduct}
      onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openProduct(); } }}
    >
      <div className={isList ? "relative h-32 w-32 shrink-0 overflow-hidden bg-[#f4f4f2] sm:h-64 sm:w-64" : "relative aspect-square overflow-hidden bg-[#111]"}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_center,#343434_0,#111_65%)] px-4 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50">Foto do produto</div>
        )}
        {!isList && <div className="absolute bottom-3 left-3 rounded-sm bg-black/90 px-3 py-1.5 text-base font-bold tracking-tight text-[#f3c74b] shadow-lg">{formatPrice(product.price_cents)}</div>}
      </div>
      <div className={isList ? "min-w-0 flex-1 py-2 pr-4" : "sr-only"}>
        <h3 className="text-base font-semibold leading-snug text-[#171717] sm:text-lg">{product.name}</h3>
        <p className="mt-2 text-xs text-black/45">Catálogo Medicamentos</p>
        <p className="mt-3 text-xl font-semibold text-[#7eb1e8] sm:text-2xl">{formatPrice(product.price_cents)}</p>
      </div>
    </article>
  );
}

function FilterBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-black/10 py-5 first:border-t-0">
      <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-black/50">{title}</h2>
      {children}
    </section>
  );
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [categorySlug, setCategorySlug] = useState<string | undefined>();
  const [sort, setSort] = useState<SortOption>("category");
  const [layout, setLayout] = useState<LayoutOption>("list");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const catalogQuery = trpc.catalog.list.useQuery({
    search,
    categorySlug,
    sort,
  });

  const products = catalogQuery.data?.products ?? [];
  const categories = catalogQuery.data?.categories ?? [];
  const activeCategoryName = useMemo(
    () => categories.find(category => category.slug === categorySlug)?.name ?? "Todos",
    [categories, categorySlug],
  );

  const chooseCategory = (slug?: string) => {
    setCategorySlug(slug);
    setFiltersOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#171717]">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-[74px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-7">
          <div className="flex flex-1 items-center gap-3 sm:max-w-[330px]">
            <Search className="h-4 w-4 shrink-0 text-black/45" />
            <Input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Buscar produtos"
              aria-label="Buscar produtos"
              className="h-10 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
            />
          </div>

          <a href="/" className="absolute left-1/2 flex -translate-x-1/2 items-center gap-3" aria-label="Catálogo Medicamentos">
            <img src={LOGO_URL} alt="Anabolismo Turbo" className="h-12 w-12 rounded-full object-cover ring-1 ring-black/10" />
            <span className="hidden text-center font-display text-sm font-black uppercase tracking-[0.12em] text-[#151515] sm:block">
              Catálogo Medicamentos
            </span>
          </a>

          <div className="flex flex-1 justify-end gap-2 sm:max-w-[330px]">
            <Button
              variant="ghost"
              size="icon"
              className="text-black/55 hover:bg-black/5 hover:text-black md:hidden"
              onClick={() => setFiltersOpen(open => !open)}
              aria-label="Abrir filtros"
            >
              {filtersOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      <nav className="border-b border-black/10 bg-white md:hidden" aria-label="Categorias rápidas">
        <div className="flex gap-7 overflow-x-auto px-5 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button type="button" onClick={() => chooseCategory()} className={`shrink-0 border-b-2 pb-2 text-sm font-semibold uppercase tracking-[0.04em] ${!categorySlug ? "border-[#171717] text-[#171717]" : "border-transparent text-black/35"}`}>Todos</button>
          {categories.map(category => <button type="button" key={category.id} onClick={() => chooseCategory(category.slug)} className={`shrink-0 border-b-2 pb-2 text-sm font-semibold uppercase tracking-[0.04em] ${categorySlug === category.slug ? "border-[#171717] text-[#171717]" : "border-transparent text-black/35"}`}>{category.name}</button>)}
        </div>
      </nav>

      <div className="border-b border-black/10 bg-[#fbfbfa] px-5 py-4 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.04em] text-[#7eb1e8] shadow-[0_5px_18px_rgba(0,0,0,0.05)]">{activeCategoryName}</span>
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="mobile-sort">Ordenar por</label>
            <select id="mobile-sort" value={sort} onChange={event => setSort(event.target.value as SortOption)} className="h-11 max-w-[140px] rounded-full border-0 bg-white px-4 text-xs font-semibold uppercase tracking-[0.04em] text-black/65 shadow-[0_5px_18px_rgba(0,0,0,0.05)] outline-none">
              <option value="category">Ordenar por</option><option value="lowest">Menor preço</option><option value="highest">Maior preço</option><option value="az">A-Z</option><option value="za">Z-A</option>
            </select>
            <button type="button" onClick={() => setLayout(current => current === "list" ? "grid" : "list")} aria-label={layout === "list" ? "Visualização em grade" : "Visualização em lista"} className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black/65 shadow-[0_5px_18px_rgba(0,0,0,0.05)]">{layout === "list" ? <List className="h-5 w-5" /> : <Grid2X2 className="h-5 w-5" />}</button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1440px]">
        <aside
          className={`${filtersOpen ? "block" : "hidden"} fixed inset-x-0 top-[74px] z-20 max-h-[calc(100vh-74px)] overflow-y-auto border-b border-black/10 bg-white px-5 pb-5 md:sticky md:top-[74px] md:block md:h-[calc(100vh-74px)] md:w-[250px] md:shrink-0 md:border-b-0 md:border-r md:px-7 md:py-7`}
        >
          <FilterBlock title="Categorias">
            <nav className="space-y-1" aria-label="Categorias do catálogo">
              <button
                onClick={() => chooseCategory()}
                className={`flex w-full items-center justify-between rounded-sm px-2 py-2 text-left text-sm transition-colors ${!categorySlug ? "bg-[#171717] font-bold text-[#f3c74b]" : "text-black/60 hover:bg-black/5 hover:text-black"}`}
              >
                <span>Todos</span>
                {!categorySlug && <span className="text-[10px]">✓</span>}
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => chooseCategory(category.slug)}
                  className={`flex w-full items-center justify-between rounded-sm px-2 py-2 text-left text-sm transition-colors ${categorySlug === category.slug ? "bg-[#171717] font-bold text-[#f3c74b]" : "text-black/60 hover:bg-black/5 hover:text-black"}`}
                >
                  <span>{category.name}</span>
                  {categorySlug === category.slug && <span className="text-[10px]">✓</span>}
                </button>
              ))}
              {categories.length === 0 && (
                <p className="px-2 py-2 text-xs leading-relaxed text-black/40">As categorias aparecerão aqui após o primeiro cadastro.</p>
              )}
            </nav>
          </FilterBlock>

          <FilterBlock title="Ordenar por">
            <div className="space-y-1">
              {[
                ["category", "Categorias"],
                ["lowest", "Menor preço"],
                ["highest", "Maior preço"],
                ["az", "A-Z"],
                ["za", "Z-A"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setSort(value as SortOption)}
                  className={`flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm transition-colors ${sort === value ? "font-bold text-black" : "text-black/55 hover:bg-black/5 hover:text-black"}`}
                >
                  {value === "az" ? <ArrowDownAZ className="h-3.5 w-3.5" /> : value === "za" ? <ArrowUpAZ className="h-3.5 w-3.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-[#c89518]" />}
                  {label}
                </button>
              ))}
            </div>
          </FilterBlock>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-7 sm:py-8">
          <div className="mb-6 hidden flex-wrap items-end justify-between gap-4 border-b border-black/10 pb-5 md:flex">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#c89518]">Anabolismo Turbo</p>
              <h1 className="font-display text-2xl font-black uppercase tracking-[0.06em] sm:text-3xl">{activeCategoryName}</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-1 rounded-sm border border-black/10 bg-white p-1 sm:flex" aria-label="Escolher layout">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLayout("grid")}
                  className={`h-8 w-8 ${layout === "grid" ? "bg-[#171717] text-[#f3c74b] hover:bg-[#171717] hover:text-[#f3c74b]" : "text-black/40"}`}
                  aria-label="Visualização em grade"
                >
                  <Grid2X2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLayout("list")}
                  className={`h-8 w-8 ${layout === "list" ? "bg-[#171717] text-[#f3c74b] hover:bg-[#171717] hover:text-[#f3c74b]" : "text-black/40"}`}
                  aria-label="Visualização em lista"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 text-xs text-black/45">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>{products.length} {products.length === 1 ? "produto" : "produtos"}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>

          {catalogQuery.isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map(item => <div key={item} className="aspect-square animate-pulse bg-black/5" />)}
            </div>
          ) : catalogQuery.error ? (
            <div className="border border-[#c89518]/30 bg-[#fffaf0] p-8 text-center">
              <h2 className="font-display text-lg font-bold uppercase tracking-[0.08em]">Catálogo em preparação</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-black/55">A conexão com o banco será ativada na configuração do projeto. Assim que os produtos forem cadastrados, eles aparecerão aqui.</p>
            </div>
          ) : products.length === 0 ? (
            <div className="border border-dashed border-black/15 bg-white p-10 text-center sm:p-16">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#171717] text-[#f3c74b]">
                <Grid2X2 className="h-6 w-6" />
              </div>
              <h2 className="font-display text-lg font-bold uppercase tracking-[0.08em]">Nenhum produto cadastrado</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-black/50">O catálogo está pronto para receber suas fotos e preços pelo painel administrativo.</p>
            </div>
          ) : (
            <div className={layout === "grid" ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "divide-y divide-black/10 border-t border-black/10"}>
              {products.map(product => <ProductCard key={product.id} product={product} layout={layout} />)}
            </div>
          )}

          <footer className="mt-16 border-t border-black/10 pt-6 text-center text-[11px] leading-relaxed text-black/40">
            <p>As informações e ofertas exibidas são de responsabilidade do catálogo.</p>
            <p className="mt-1 uppercase tracking-[0.16em]">Catálogo Medicamentos · Anabolismo Turbo</p>
          </footer>
        </main>
      </div>

      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Olá, gostaria de saber mais sobre os produtos do Catálogo Medicamentos.")}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Falar com o catálogo pelo WhatsApp"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_rgba(37,211,102,0.35)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40"
      >
        <MessageCircle className="h-7 w-7" fill="currentColor" />
      </a>
    </div>
  );
}
