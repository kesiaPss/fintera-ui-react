import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../lib/apiClient", () => ({
  apiClient: { get: vi.fn() },
}));

import { apiClient } from "../../lib/apiClient";
import { contractsApi } from "./api";

describe("contractsApi identity documents", () => {
  beforeEach(() => {
    apiClient.get.mockReset();
    apiClient.get.mockResolvedValue({});
  });

  it("lists the identity documents of a contract by GUID", async () => {
    await contractsApi.listIdentityDocuments("guid-9");

    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/v1/contracts/guid-9/identity_documents"
    );
  });

  it("fetches a content or preview URL as a blob", async () => {
    await contractsApi.fetchIdentityDocumentBlob(
      "/api/v1/identity_documents/3/preview"
    );

    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/v1/identity_documents/3/preview",
      { responseType: "blob" }
    );
  });
});

describe("contractsApi report downloads", () => {
  beforeEach(() => {
    apiClient.get.mockReset();
    apiClient.get.mockResolvedValue(new Blob(["pdf"]));
  });

  it("downloads the customer record as a blob", async () => {
    await contractsApi.downloadCustomerRecord(16);

    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/v1/reports/customer_record_pdf",
      { params: { contract_id: 16 }, responseType: "blob" }
    );
  });

  it("downloads a named contract document as a blob", async () => {
    await contractsApi.downloadDocument("user_promise_contract_pdf", {
      contract_id: 16,
      user_id: 7,
    });

    expect(apiClient.get).toHaveBeenCalledWith(
      "/api/v1/reports/user_promise_contract_pdf",
      {
        params: { contract_id: 16, user_id: 7 },
        responseType: "blob",
      }
    );
  });
});
