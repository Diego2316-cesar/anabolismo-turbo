import fs from "node:fs/promises";
import path from "node:path";

const supabaseUrl = (process.env.SUPABASE_URL ?? "").replace(/\/+$/, "");
const supabaseKey = process.env.SUPABASE_KEY ?? "";
const assetsDir = process.env.ASSETS_DIR ?? "/home/ubuntu/webdev-static-assets";
const bucket = "catalog-images";

if (!supabaseUrl || !supabaseKey) throw new Error("SUPABASE_URL and SUPABASE_KEY are required");

const headers = {
  apikey: supabaseKey,
  Authorization: `Bearer ${supabaseKey}`,
};

async function request(url, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: { ...headers, ...(init.headers ?? {}) },
  });
  const text = await response.text();
  let body;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!response.ok) throw new Error(`${response.status} ${url}: ${typeof body === "string" ? body : JSON.stringify(body)}`);
  return body;
}

try {
  await request(`${supabaseUrl}/storage/v1/bucket`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: bucket, name: bucket, public: true }),
  }).catch((error) => {
    if (!String(error.message).startsWith("409 ")) throw error;
  });

  const products = await request(`${supabaseUrl}/rest/v1/catalog_products?select=id,image_url&limit=200`);
  const assetNames = new Set(await fs.readdir(assetsDir));
  const publicBase = `${supabaseUrl}/storage/v1/object/public/${bucket}`;
  const updates = [];

  for (const product of products) {
    if (!product.image_url) continue;
    const storedName = path.basename(product.image_url);
    const localName = storedName.replace(/_[0-9a-f]{8}(?=\.[^.]+$)/i, "");
    if (!assetNames.has(localName)) throw new Error(`Local asset not found for ${storedName}: ${localName}`);
    const localPath = path.join(assetsDir, localName);
    const bytes = await fs.readFile(localPath);
    const ext = path.extname(localName).toLowerCase();
    const contentType = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
    await request(`${supabaseUrl}/storage/v1/object/${bucket}/${encodeURIComponent(localName)}`, {
      method: "POST",
      headers: { ...headers, "Content-Type": contentType, "x-upsert": "true" },
      body: bytes,
    });
    const imageUrl = `${publicBase}/${encodeURIComponent(localName)}`;
    await request(`${supabaseUrl}/rest/v1/catalog_products?id=eq.${encodeURIComponent(product.id)}`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ image_url: imageUrl }),
    });
    updates.push({ id: product.id, imageUrl });
  }

  console.log(JSON.stringify({ bucket, updated: updates.length, urls: updates.map(({ imageUrl }) => imageUrl) }, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
