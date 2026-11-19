import { describe, expect, it } from "vitest";
import {
  displayUserEmail,
  isHistoricalPlaceholderEmail,
} from "./historicalEmail";

const t = (key) =>
  ({
    "users.noEmail": "No email",
  }[key] || key);

describe("historical client email", () => {
  it("detects placeholder emails only on historical clients", () => {
    expect(
      isHistoricalPlaceholderEmail({
        historical_client: true,
        email: "historico+0801@fintera.local",
      })
    ).toBe(true);
    expect(
      isHistoricalPlaceholderEmail({
        historical_client: false,
        email: "historico+0801@fintera.local",
      })
    ).toBe(false);
    expect(
      isHistoricalPlaceholderEmail({
        historical_client: true,
        email: "cliente@example.com",
      })
    ).toBe(false);
  });

  it("renders a friendly label for placeholder emails", () => {
    expect(
      displayUserEmail(
        { historical_client: true, email: "historico+0801@fintera.local" },
        t
      )
    ).toBe("No email");
    expect(
      displayUserEmail(
        { historical_client: true, email: "cliente@example.com" },
        t
      )
    ).toBe("cliente@example.com");
  });
});
