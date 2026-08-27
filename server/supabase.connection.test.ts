import { describe, expect, it } from "vitest";

const supabaseUrl = process.env.SUPABASE_URL ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

describe("Supabase service connection", () => {
  it("accepts the configured service role key for a lightweight read", async () => {
    expect(supabaseUrl, "SUPABASE_URL is required for this validation").toBeTruthy();
    expect(serviceRoleKey, "SUPABASE_SERVICE_ROLE_KEY is required for this validation").toBeTruthy();
    const response = await fetch(`${supabaseUrl}/rest/v1/catalog_categories?select=id&limit=1`, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    });
    expect(response.ok, await response.text()).toBe(true);
  }, 15_000);
});
