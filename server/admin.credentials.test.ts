import { describe, expect, it } from "vitest";
import { appRouter } from "./routers.js";
import { getAdminSession } from "./adminAuth.js";
import type { TrpcContext } from "./_core/context.js";

describe("admin credentials", () => {
  it("validates the configured admin credentials through the API procedure", async () => {
    const username = process.env.ADMIN_USERNAME ?? "";
    const password = process.env.ADMIN_PASSWORD ?? "";

    expect(username, "ADMIN_USERNAME is required for this validation").toBeTruthy();
    expect(password, "ADMIN_PASSWORD is required for this validation").toBeTruthy();

    const cookies: Array<{ name: string; value: string }> = [];
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {
        cookie: (name: string, value: string) => cookies.push({ name, value }),
      } as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.validate({ username, password });

    expect(result).toEqual({ valid: true });
    expect(cookies).toHaveLength(1);
    expect(cookies[0]?.name).toBe("catalog_admin_session");
    const session = getAdminSession({ headers: { cookie: `${cookies[0]?.name}=${cookies[0]?.value}` } } as TrpcContext["req"]);
    expect(session?.username).toBe(username);

    const securedContext: TrpcContext = {
      user: null,
      adminSession: session,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const securedCaller = appRouter.createCaller(securedContext);
    await expect(securedCaller.admin.changePassword({ currentPassword: password, newPassword: password })).resolves.toEqual({ success: true });
    await expect(securedCaller.admin.changePassword({ currentPassword: "senha-incorreta", newPassword: password })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
