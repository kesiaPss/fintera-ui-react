import { describe, expect, it } from "vitest";
import { CSV_FIELDS, TEMPLATE_HEADERS } from "./historicalCsv";

describe("historical CSV template", () => {
  it("includes the rate and commission columns", () => {
    expect(TEMPLATE_HEADERS).toContain("tasa");
    expect(TEMPLATE_HEADERS).toContain("comision");
    expect(CSV_FIELDS.map((field) => field.key)).toEqual(
      expect.arrayContaining(["rate", "commission_amount"])
    );
  });
});
