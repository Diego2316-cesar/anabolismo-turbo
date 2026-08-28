import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies.js";
import { systemRouter } from "./_core/systemRouter.js";
import { adminProcedure, publicProcedure, router } from "./_core/trpc.js";
import {
  createCategory,
  createProduct,
  deleteProduct,
  listCategories,
  listProducts,
  updateProduct,
} from "./supabase.js";
import { storagePut } from "./storage.js";
import { changeAdminPassword, clearAdminSession, setAdminSession, verifyAdminCredentials } from "./adminAuth.js";

const catalogInput = z.object({
  search: z.string().trim().optional().default(""),
  categorySlug: z.string().trim().optional(),
  sort: z.enum(["category", "lowest", "highest", "az", "za"]).optional().default("category"),
});

export function sortProducts<T extends { name: string; price_cents: number; category_id: string | null }>(products: T[], categories: { id: string; name: string }[], sort: string) {
  const categoryNames = new Map(categories.map(category => [category.id, category.name]));
  return [...products].sort((a, b) => {
    if (sort === "lowest") return a.price_cents - b.price_cents;
    if (sort === "highest") return b.price_cents - a.price_cents;
    if (sort === "az") return a.name.localeCompare(b.name, "pt-BR");
    if (sort === "za") return b.name.localeCompare(a.name, "pt-BR");
    return (categoryNames.get(a.category_id ?? "") ?? "").localeCompare(categoryNames.get(b.category_id ?? "") ?? "", "pt-BR") || a.name.localeCompare(b.name, "pt-BR");
  });
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  admin: router({
    me: publicProcedure.query(({ ctx }) => ctx.adminSession ? { username: ctx.adminSession.username } : null),
    validate: publicProcedure.input(z.object({
      username: z.string().trim().min(1).max(100),
      password: z.string().min(1).max(200),
    })).mutation(async ({ input, ctx }) => {
      const valid = await verifyAdminCredentials(input.username, input.password);
      if (!valid) throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário ou senha inválidos." });
      setAdminSession(ctx.res, ctx.req, input.username);
      return { valid: true } as const;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      clearAdminSession(ctx.res, ctx.req);
      return { success: true } as const;
    }),
    changePassword: adminProcedure.input(z.object({
      currentPassword: z.string().min(1).max(200),
      newPassword: z.string().min(8).max(200),
    })).mutation(async ({ input, ctx }) => {
      const username = ctx.adminSession?.username;
      if (!username) throw new TRPCError({ code: "FORBIDDEN", message: "Entre com o login próprio do ADM para trocar a senha." });
      const changed = await changeAdminPassword(username, input.currentPassword, input.newPassword);
      if (!changed) throw new TRPCError({ code: "UNAUTHORIZED", message: "A senha atual está incorreta." });
      return { success: true } as const;
    }),
  }),
  catalog: router({
    list: publicProcedure.input(catalogInput).query(async ({ input }) => {
      try {
        const [categories, products] = await Promise.all([listCategories(), listProducts()]);
        const search = input.search.toLocaleLowerCase("pt-BR");
        const selectedCategory = input.categorySlug ? categories.find(category => category.slug === input.categorySlug) : undefined;
        const filtered = products.filter(product => {
          const matchesSearch = !search || product.name.toLocaleLowerCase("pt-BR").includes(search);
          const matchesCategory = !selectedCategory || product.category_id === selectedCategory.id;
          return matchesSearch && matchesCategory;
        });
        return {
          categories,
          products: sortProducts(filtered, categories, input.sort),
        };
      } catch (error) {
        console.warn("[Catalog] Public listing unavailable:", error);
        return { categories: [], products: [] };
      }
    }),
    adminList: adminProcedure.query(async () => {
      const [categories, products] = await Promise.all([listCategories(true), listProducts(true)]);
      return { categories, products };
    }),
    uploadImage: adminProcedure.input(z.object({
      fileName: z.string().trim().min(1).max(160),
      mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
      data: z.string().min(1).max(12_000_000),
    })).mutation(async ({ input }) => {
      const safeName = input.fileName.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
      const result = await storagePut(`catalog-products/${crypto.randomUUID()}-${safeName}`, Buffer.from(input.data, "base64"), input.mimeType);
      return { url: result.url };
    }),
    create: adminProcedure.input(z.object({
      name: z.string().trim().min(1).max(180),
      priceCents: z.number().int().min(0),
      imageUrl: z.string().trim().min(1).max(1000).regex(/^(https?:\/\/|\/manus-storage\/)/).nullable().optional(),
      categoryId: z.string().uuid().nullable().optional(),
      isActive: z.boolean().optional(),
      sortOrder: z.number().int().min(0).optional(),
    })).mutation(async ({ input }) => createProduct(input)),
    update: adminProcedure.input(z.object({
      id: z.string().uuid(),
      name: z.string().trim().min(1).max(180).optional(),
      priceCents: z.number().int().min(0).optional(),
      imageUrl: z.string().trim().min(1).max(1000).regex(/^(https?:\/\/|\/manus-storage\/)/).nullable().optional(),
      categoryId: z.string().uuid().nullable().optional(),
      isActive: z.boolean().optional(),
      sortOrder: z.number().int().min(0).optional(),
    })).mutation(async ({ input }) => updateProduct(input)),
    remove: adminProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ input }) => deleteProduct(input.id)),
    createCategory: adminProcedure.input(z.object({
      name: z.string().trim().min(1).max(100),
      slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/),
      sortOrder: z.number().int().min(0).optional(),
    })).mutation(async ({ input }) => createCategory(input)),
  }),
});

export type AppRouter = typeof appRouter;
