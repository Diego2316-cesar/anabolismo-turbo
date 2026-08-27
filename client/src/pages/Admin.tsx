import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { ImagePlus, Loader2, Pencil, Plus, RefreshCw, Tags, Trash2, UploadCloud } from "lucide-react";
import { FormEvent, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const LOGO_URL = "/manus-storage/anabolismo-turbo-logo-transparent_80e1ec8b.png";

function formatPrice(priceCents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(priceCents / 100);
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function EmptyPanel({ message }: { message: string }) {
  return <div className="rounded-lg border border-dashed border-black/15 bg-white p-10 text-center text-sm text-black/50">{message}</div>;
}

function ProductsPanel() {
  const utils = trpc.useUtils();
  const listQuery = trpc.catalog.adminList.useQuery(undefined, { retry: false });
  const createProduct = trpc.catalog.create.useMutation({
    onSuccess: async () => {
      await utils.catalog.adminList.invalidate();
      toast.success("Produto cadastrado");
      setName("");
      setPrice("");
      setCategoryId("");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    },
    onError: error => toast.error(error.message),
  });
  const uploadImage = trpc.catalog.uploadImage.useMutation({ onError: error => toast.error(error.message) });
  const removeProduct = trpc.catalog.remove.useMutation({
    onSuccess: async () => {
      await utils.catalog.adminList.invalidate();
      toast.success("Produto removido");
    },
    onError: error => toast.error(error.message),
  });
  const updateProduct = trpc.catalog.update.useMutation({
    onSuccess: async () => {
      await utils.catalog.adminList.invalidate();
      toast.success("Produto atualizado");
    },
    onError: error => toast.error(error.message),
  });
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  const categories = listQuery.data?.categories ?? [];
  const products = listQuery.data?.products ?? [];
  const isSaving = createProduct.isPending || uploadImage.isPending || updateProduct.isPending;

  const startEdit = (product: (typeof products)[number]) => {
    setEditingId(product.id);
    setEditName(product.name);
    setEditPrice((product.price_cents / 100).toFixed(2).replace(".", ","));
    setEditCategoryId(product.category_id ?? "");
    setEditFile(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFile(null);
    if (editFileRef.current) editFileRef.current.value = "";
  };

  const submitEdit = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingId) return;
    const parsedPrice = Number(editPrice.replace(",", "."));
    if (!editName.trim() || !Number.isFinite(parsedPrice) || parsedPrice < 0) {
      toast.error("Informe nome e preço válidos");
      return;
    }
    let imageUrl: string | undefined;
    if (editFile) {
      if (!editFile.type.startsWith("image/") || editFile.size > 8 * 1024 * 1024) {
        toast.error("Escolha uma imagem de até 8 MB");
        return;
      }
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(editFile);
      });
      const base64 = dataUrl.split(",")[1] ?? "";
      const mimeType = editFile.type as "image/jpeg" | "image/png" | "image/webp" | "image/gif";
      const upload = await uploadImage.mutateAsync({ fileName: editFile.name, mimeType, data: base64 });
      imageUrl = upload.url;
    }
    await updateProduct.mutateAsync({
      id: editingId,
      name: editName.trim(),
      priceCents: Math.round(parsedPrice * 100),
      categoryId: editCategoryId || null,
      ...(imageUrl ? { imageUrl } : {}),
    });
    cancelEdit();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const parsedPrice = Number(price.replace(",", "."));
    if (!name.trim() || !Number.isFinite(parsedPrice) || parsedPrice < 0) {
      toast.error("Informe nome e preço válidos");
      return;
    }

    let imageUrl: string | null = null;
    if (file) {
      if (!file.type.startsWith("image/") || file.size > 8 * 1024 * 1024) {
        toast.error("Escolha uma imagem de até 8 MB");
        return;
      }
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const base64 = dataUrl.split(",")[1] ?? "";
      const mimeType = file.type as "image/jpeg" | "image/png" | "image/webp" | "image/gif";
      const upload = await uploadImage.mutateAsync({ fileName: file.name, mimeType, data: base64 });
      imageUrl = upload.url;
    }

    await createProduct.mutateAsync({
      name: name.trim(),
      priceCents: Math.round(parsedPrice * 100),
      categoryId: categoryId || null,
      imageUrl,
      isActive: true,
    });
  };

  if (listQuery.isLoading) return <EmptyPanel message="Carregando produtos..." />;
  if (listQuery.error) return <EmptyPanel message="O painel precisa das credenciais administrativas do Supabase para carregar os produtos." />;

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <Card className="border-black/10 shadow-sm">
        <CardHeader>
          <CardTitle className="font-display uppercase tracking-[0.06em]">Adicionar produto</CardTitle>
          <CardDescription>Cadastre a foto e o preço que aparecerão no catálogo público.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="product-name">Nome interno do produto</Label>
              <Input id="product-name" value={name} onChange={event => setName(event.target.value)} placeholder="Ex.: Produto" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-price">Preço (R$)</Label>
              <Input id="product-price" inputMode="decimal" value={price} onChange={event => setPrice(event.target.value)} placeholder="0,00" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-category">Categoria</Label>
              <select id="product-category" value={categoryId} onChange={event => setCategoryId(event.target.value)} className="flex h-10 w-full rounded-md border border-black/15 bg-white px-3 text-sm outline-none focus:border-[#c89518] focus:ring-2 focus:ring-[#c89518]/20">
                <option value="">Sem categoria</option>
                {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="product-image">Foto do produto</Label>
              <label htmlFor="product-image" className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-black/20 bg-[#fafafa] px-3 py-4 text-sm text-black/55 transition-colors hover:border-[#c89518] hover:bg-[#fffaf0]">
                <ImagePlus className="h-5 w-5 text-[#c89518]" />
                <span className="min-w-0 truncate">{file?.name ?? "Escolher imagem"}</span>
              </label>
              <input ref={fileRef} id="product-image" type="file" accept="image/*" className="sr-only" onChange={event => setFile(event.target.files?.[0] ?? null)} />
              <p className="text-[11px] leading-relaxed text-black/40">JPG, PNG ou WEBP. Limite de 8 MB.</p>
            </div>
            <Button type="submit" disabled={isSaving} className="w-full bg-[#171717] text-[#f3c74b] hover:bg-[#c89518] hover:text-[#171717]">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
              {isSaving ? "Salvando..." : "Cadastrar produto"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-black/10 shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="font-display uppercase tracking-[0.06em]">Produtos cadastrados</CardTitle>
            <CardDescription>{products.length} {products.length === 1 ? "item" : "itens"} no painel.</CardDescription>
          </div>
          <Button variant="outline" size="icon" onClick={() => listQuery.refetch()} aria-label="Atualizar lista"><RefreshCw className="h-4 w-4" /></Button>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? <EmptyPanel message="Nenhum produto cadastrado ainda. Adicione a primeira foto e preço ao lado." /> : (
            <div className="space-y-3">
              {products.map(product => editingId === product.id ? (
                <form key={product.id} onSubmit={submitEdit} className="space-y-4 rounded-md border border-[#c89518]/50 bg-[#fffaf0] p-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1 sm:col-span-2"><Label htmlFor={`edit-name-${product.id}`}>Nome</Label><Input id={`edit-name-${product.id}`} value={editName} onChange={event => setEditName(event.target.value)} /></div>
                    <div className="space-y-1"><Label htmlFor={`edit-price-${product.id}`}>Preço (R$)</Label><Input id={`edit-price-${product.id}`} inputMode="decimal" value={editPrice} onChange={event => setEditPrice(event.target.value)} /></div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1"><Label htmlFor={`edit-category-${product.id}`}>Categoria</Label><select id={`edit-category-${product.id}`} value={editCategoryId} onChange={event => setEditCategoryId(event.target.value)} className="flex h-10 w-full rounded-md border border-black/15 bg-white px-3 text-sm outline-none focus:border-[#c89518] focus:ring-2 focus:ring-[#c89518]/20"><option value="">Sem categoria</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
                    <div className="space-y-1"><Label htmlFor={`edit-image-${product.id}`}>Trocar foto</Label><label htmlFor={`edit-image-${product.id}`} className="flex h-10 cursor-pointer items-center gap-2 rounded-md border border-dashed border-black/20 bg-white px-3 text-sm text-black/55 hover:border-[#c89518]"><ImagePlus className="h-4 w-4 text-[#c89518]" /><span className="truncate">{editFile?.name ?? "Escolher nova imagem"}</span></label><input ref={editFileRef} id={`edit-image-${product.id}`} type="file" accept="image/*" className="sr-only" onChange={event => setEditFile(event.target.files?.[0] ?? null)} /></div>
                  </div>
                  <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={cancelEdit}>Cancelar</Button><Button type="submit" disabled={isSaving} className="bg-[#171717] text-[#f3c74b] hover:bg-[#c89518] hover:text-[#171717]">{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Salvar alterações</Button></div>
                </form>
              ) : (
                <div key={product.id} className="flex items-center gap-4 rounded-md border border-black/10 bg-[#fafafa] p-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-[#171717]">
                    {product.image_url ? <img src={product.image_url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[9px] uppercase tracking-wider text-white/45">Sem foto</div>}
                  </div>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{product.name}</p><p className="mt-1 text-sm font-bold text-[#b17d0d]">{formatPrice(product.price_cents)}</p></div>
                  <div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={() => startEdit(product)}><Pencil className="mr-1.5 h-3.5 w-3.5" />Editar</Button><Button variant="outline" size="sm" onClick={() => updateProduct.mutate({ id: product.id, isActive: !product.is_active })}>{product.is_active ? "Ocultar" : "Publicar"}</Button><Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => removeProduct.mutate({ id: product.id })} aria-label={`Remover ${product.name}`}><Trash2 className="h-4 w-4" /></Button></div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CategoriesPanel() {
  const utils = trpc.useUtils();
  const listQuery = trpc.catalog.adminList.useQuery(undefined, { retry: false });
  const createCategory = trpc.catalog.createCategory.useMutation({
    onSuccess: async () => {
      await utils.catalog.adminList.invalidate();
      toast.success("Categoria criada");
      setName("");
    },
    onError: error => toast.error(error.message),
  });
  const [name, setName] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    createCategory.mutate({ name: name.trim(), slug: slugify(name) });
  };

  if (listQuery.isLoading) return <EmptyPanel message="Carregando categorias..." />;
  if (listQuery.error) return <EmptyPanel message="O painel precisa das credenciais administrativas do Supabase para carregar as categorias." />;

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <Card className="border-black/10 shadow-sm">
        <CardHeader><CardTitle className="font-display uppercase tracking-[0.06em]">Nova categoria</CardTitle><CardDescription>Organize os produtos pela barra lateral do catálogo.</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="flex gap-2"><Input value={name} onChange={event => setName(event.target.value)} placeholder="Nome da categoria" /><Button type="submit" disabled={createCategory.isPending} size="icon" className="shrink-0 bg-[#171717] text-[#f3c74b] hover:bg-[#c89518] hover:text-[#171717]" aria-label="Criar categoria"><Plus className="h-4 w-4" /></Button></form>
        </CardContent>
      </Card>
      <Card className="border-black/10 shadow-sm"><CardHeader><CardTitle className="font-display uppercase tracking-[0.06em]">Categorias cadastradas</CardTitle><CardDescription>Elas ficam disponíveis no filtro lateral da loja.</CardDescription></CardHeader><CardContent>{listQuery.data?.categories.length ? <div className="grid gap-2 sm:grid-cols-2">{listQuery.data.categories.map(category => <div key={category.id} className="flex items-center gap-3 rounded-md border border-black/10 p-3"><Tags className="h-4 w-4 text-[#c89518]" /><span className="text-sm font-medium">{category.name}</span></div>)}</div> : <EmptyPanel message="Nenhuma categoria cadastrada ainda." />}</CardContent></Card>
    </div>
  );
}

export default function Admin() {
  const [location, setLocation] = useLocation();
  const isCategories = location === "/admin/categorias";
  const isProducts = location === "/admin/produtos";

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1280px] space-y-7">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-6">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Anabolismo Turbo" className="h-12 w-12 rounded-full object-cover ring-1 ring-black/10" />
            <div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#b17d0d]">Painel administrativo</p><h1 className="font-display text-2xl font-black uppercase tracking-[0.06em]">Catálogo Medicamentos</h1></div>
          </div>
          <Button variant="outline" onClick={() => setLocation("/")}>Ver catálogo público</Button>
        </header>
        {!isProducts && !isCategories && <Card className="border-black/10 bg-[#171717] text-white shadow-sm"><CardContent className="flex flex-wrap items-center justify-between gap-6 p-7"><div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#f3c74b]">Estrutura pronta</p><h2 className="mt-2 font-display text-2xl font-bold uppercase tracking-[0.04em]">Comece pelos produtos</h2><p className="mt-2 max-w-xl text-sm leading-relaxed text-white/60">Adicione fotos e preços, organize por categorias e publique ou oculte itens quando precisar.</p></div><Button onClick={() => setLocation("/admin/produtos")} className="bg-[#f3c74b] text-[#171717] hover:bg-white">Gerenciar produtos</Button></CardContent></Card>}
        {isProducts && <ProductsPanel />}
        {isCategories && <CategoriesPanel />}
      </div>
    </DashboardLayout>
  );
}
