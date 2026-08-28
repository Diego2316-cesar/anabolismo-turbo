import { describe, expect, it } from "vitest";
import { sortProducts } from "./routers.js";

type TestProduct = {
  id: string;
  name: string;
  price_cents: number;
  category_id: string | null;
};

const products: TestProduct[] = [
  { id: "1", name: "Beta", price_cents: 2500, category_id: null },
  { id: "2", name: "Alpha", price_cents: 1000, category_id: null },
  { id: "3", name: "Gamma", price_cents: 5000, category_id: null },
];

describe("catalog sorting", () => {
  it("sorts products from lowest to highest price", () => {
    expect(sortProducts(products, [], "lowest").map(product => product.id)).toEqual(["2", "1", "3"]);
  });

  it("sorts products alphabetically in both directions", () => {
    expect(sortProducts(products, [], "az").map(product => product.name)).toEqual(["Alpha", "Beta", "Gamma"]);
    expect(sortProducts(products, [], "za").map(product => product.name)).toEqual(["Gamma", "Beta", "Alpha"]);
  });
});
