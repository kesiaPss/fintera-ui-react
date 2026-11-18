import { describe, expect, it } from "vitest";
import { readPagination } from "./pagination";

describe("readPagination", () => {
  it("reads total_pages and total from the standard response", () => {
    expect(readPagination({ total: 45, total_pages: 3 }, 20)).toEqual({
      total: 45,
      totalPages: 3,
    });
  });

  it("falls back to the legacy pages key", () => {
    expect(readPagination({ total: 9, pages: 1 }, 20)).toEqual({
      total: 9,
      totalPages: 1,
    });
  });

  it("computes pages from the total when the API omits them", () => {
    expect(readPagination({ total: 41 }, 20)).toEqual({
      total: 41,
      totalPages: 3,
    });
  });

  it("uses count when total is missing", () => {
    expect(readPagination({ count: 21 }, 20)).toEqual({
      total: 21,
      totalPages: 2,
    });
  });

  it("returns one page for an empty list", () => {
    expect(readPagination({}, 20)).toEqual({ total: 0, totalPages: 1 });
  });
});
