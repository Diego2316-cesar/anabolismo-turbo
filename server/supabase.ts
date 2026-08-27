import { ENV } from "./_core/env";

export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
};

export type CatalogProduct = {
  id: string;
  name: string;
  price_cents: number;
  image_url: string | null;
  category_id: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  category?: CatalogCategory | null;
};

function getConfig() {
  const url = (ENV.supabaseUrl || "https://xsveypccptxvpiygbnqv.supabase.co").replace(/\/+$/, "");
  const key = ENV.supabaseServiceRoleKey || ENV.supabaseAnonKey;
  if (!url || !key) {
    throw new Error("Supabase não configurado. Defina SUPABASE_URL e a chave pública/administrativa do projeto.");
  }
  return { url, key };
}

async function supabaseRequest<T>(path: string, init: RequestInit = {}, admin = false): Promise<T> {
  const { url, key } = getConfig();
  const requestKey = admin ? ENV.supabaseServiceRoleKey : key;
  if (admin && !requestKey) {
    throw new Error("Painel administrativo indisponível: SUPABASE_SERVICE_ROLE_KEY não configurada.");
  }

  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: requestKey,
      Authorization: `Bearer ${requestKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(`Supabase ${response.status}: ${details || response.statusText}`);
  }

  if (response.status === 204) return [] as T;
  return (await response.json()) as T;
}

export async function listCategories(includeInactive = false) {
  const filter = includeInactive ? "" : "&is_active=eq.true";
  return supabaseRequest<CatalogCategory[]>(`catalog_categories?select=id,name,slug,is_active,sort_order&order=sort_order.asc,name.asc${filter}&limit=200`, {}, includeInactive);
}

export async function listProducts(includeInactive = false) {
  const filter = includeInactive ? "" : "&is_active=eq.true";
  return supabaseRequest<CatalogProduct[]>(`catalog_products?select=id,name,price_cents,image_url,category_id,is_active,sort_order,created_at&order=sort_order.asc,created_at.desc${filter}&limit=200`, {}, includeInactive);
}

async function ensureCategoryExists(categoryId: string | null | undefined) {
  if (!categoryId) return;
  const rows = await supabaseRequest<Array<{ id: string }>>(`catalog_categories?id=eq.${encodeURIComponent(categoryId)}&select=id&limit=1`, {}, true);
  if (!rows[0]) throw new Error("A categoria selecionada não existe mais.");
}

export async function createProduct(input: {
  name: string;
  priceCents: number;
  imageUrl?: string | null;
  categoryId?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}) {
  await ensureCategoryExists(input.categoryId);
  const rows = await supabaseRequest<CatalogProduct[]>("catalog_products", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      price_cents: input.priceCents,
      image_url: input.imageUrl ?? null,
      category_id: input.categoryId ?? null,
      is_active: input.isActive ?? true,
      sort_order: input.sortOrder ?? 0,
    }),
  }, true);
  return rows[0];
}

export async function updateProduct(input: {
  id: string;
  name?: string;
  priceCents?: number;
  imageUrl?: string | null;
  categoryId?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}) {
  await ensureCategoryExists(input.categoryId);
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.priceCents !== undefined) patch.price_cents = input.priceCents;
  if (input.imageUrl !== undefined) patch.image_url = input.imageUrl;
  if (input.categoryId !== undefined) patch.category_id = input.categoryId;
  if (input.isActive !== undefined) patch.is_active = input.isActive;
  if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder;

  const rows = await supabaseRequest<CatalogProduct[]>(`catalog_products?id=eq.${encodeURIComponent(input.id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  }, true);
  return rows[0];
}

export async function deleteProduct(id: string) {
  await supabaseRequest<unknown[]>(`catalog_products?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" }, true);
  return { success: true } as const;
}

export async function createCategory(input: { name: string; slug: string; sortOrder?: number }) {
  const rows = await supabaseRequest<CatalogCategory[]>("catalog_categories", {
    method: "POST",
    body: JSON.stringify({ name: input.name, slug: input.slug, sort_order: input.sortOrder ?? 0 }),
  }, true);
  return rows[0];
}
