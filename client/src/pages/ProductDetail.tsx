import { trpc } from "@/lib/trpc";
import { ArrowLeft, Check, Copy, MessageCircle, Share2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useRoute } from "wouter";

const LOGO_URL = "https://xsveypccptxvpiygbnqv.supabase.co/storage/v1/object/public/catalog-images/anabolismo-turbo-logo-novo.png";
const WHATSAPP_NUMBER = "5519994699667";

function formatPrice(priceCents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(priceCents / 100);
}

export default function ProductDetail() {
  const [, params] = useRoute("/produto/:id");
  const input = useMemo(() => ({ search: "", sort: "category" as const }), []);
  const catalogQuery = trpc.catalog.list.useQuery(input);
  const product = catalogQuery.data?.products.find(item => item.id === params?.id);
  const [copied, setCopied] = useState(false);
  const whatsappHref = product
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Olá, gostaria de saber mais sobre ${product.name}.` )}`
    : `https://wa.me/${WHATSAPP_NUMBER}`;
  const shareProduct = async () => {
    if (!product) return;
    const shareData = { title: product.name, text: `Confira ${product.name} no Catálogo Medicamentos.`, url: window.location.href };
    if (navigator.share) {
      try { await navigator.share(shareData); return; } catch (error) { if ((error as DOMException).name === "AbortError") return; }
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  if (catalogQuery.isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f7f7f5] text-sm text-black/50">Carregando produto...</div>;
  }

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-5">
        <div className="text-center">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[#c89518]">Catálogo Medicamentos</p>
          <h1 className="font-display text-2xl font-black uppercase">Produto não encontrado</h1>
          <Link href="/" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#9b6d00] hover:underline"><ArrowLeft className="h-4 w-4" />Voltar ao catálogo</Link>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#171717]">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex min-h-[74px] max-w-[1100px] items-center justify-between px-4 sm:px-7">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-black/65 transition-colors hover:text-black"><ArrowLeft className="h-4 w-4" />Voltar</Link>
          <Link href="/" aria-label="Catálogo Medicamentos"><img src={LOGO_URL} alt="Anabolismo Turbo" className="h-14 w-24 object-contain" /></Link>
          <div className="flex items-center gap-4"><button type="button" onClick={shareProduct} aria-label="Compartilhar produto" className="text-black/45 transition-colors hover:text-[#a97400]"><Share2 className="h-5 w-5" /></button><a href={whatsappHref} target="_blank" rel="noreferrer" aria-label="Falar pelo WhatsApp" className="text-[#14883b] transition-transform hover:scale-105"><MessageCircle className="h-6 w-6" fill="currentColor" /></a></div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1100px] gap-8 px-4 py-8 sm:px-7 sm:py-12 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
        <div className="overflow-hidden rounded-sm border border-black/10 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
          {product.image_url ? <img src={product.image_url} alt={product.name} className="aspect-square w-full object-cover" /> : <div className="flex aspect-square items-center justify-center bg-[#171717] text-sm text-white/50">Foto não disponível</div>}
        </div>
        <section>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-[#c89518]">Anabolismo Turbo</p>
          <h1 className="font-display text-3xl font-black uppercase leading-tight tracking-[0.03em] sm:text-4xl">{product.name}</h1>
          <div className="mt-7 border-y border-black/10 py-5"><p className="text-xs uppercase tracking-[0.18em] text-black/45">Preço do produto</p><p className="mt-2 text-3xl font-black text-[#a97400]">{formatPrice(product.price_cents)}</p></div>
          <p className="mt-6 text-sm leading-7 text-black/60">Consulte disponibilidade e condições diretamente pelo WhatsApp do catálogo.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row"><a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-sm bg-[#25D366] px-6 text-sm font-bold text-white shadow-[0_10px_25px_rgba(37,211,102,0.22)] transition-transform hover:-translate-y-0.5 sm:w-auto"><MessageCircle className="h-5 w-5" fill="currentColor" />Consultar pelo WhatsApp</a><button type="button" onClick={shareProduct} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-sm border border-black/15 bg-white px-6 text-sm font-bold text-black/65 transition-colors hover:border-[#c89518] hover:text-[#a97400] sm:w-auto">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? "Link copiado" : "Compartilhar"}</button></div>
          <Link href="/" className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-black/45 hover:text-black"><ArrowLeft className="h-3.5 w-3.5" />Continuar navegando</Link>
        </section>
      </main>
    </div>
  );
}
