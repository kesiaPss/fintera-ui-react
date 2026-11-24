import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, beforeEach, vi } from "vitest";

const listIdentityDocuments = vi.fn();
const fetchIdentityDocumentBlob = vi.fn();

vi.mock("@/features/contracts/api", () => ({
  contractsApi: {
    listIdentityDocuments: (...args) => listIdentityDocuments(...args),
    fetchIdentityDocumentBlob: (...args) => fetchIdentityDocumentBlob(...args),
  },
}));

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({
    locale: "es",
    setLocale: () => {},
    t: (key) => {
      const strings = {
        "common.loading": "Cargando...",
        "common.processing": "Procesando...",
        "common.view": "Ver",
        "common.download": "Descargar",
        "common.retry": "Reintentar",
        "common.downloadError": "Error al descargar el archivo",
        "common.downloadSuccess": "Descarga exitosa",
        "contracts.identityDocuments.title": "Documentos del Cliente",
        "contracts.identityDocuments.subtitle": "Documentos de identificación del cliente",
        "contracts.identityDocuments.dni": "DNI",
        "contracts.identityDocuments.rtn": "RTN",
        "contracts.identityDocuments.notUploaded": "Sin documento subido",
        "contracts.identityDocuments.readOnly": "Solo lectura",
        "contracts.identityDocuments.attachments": "Archivos adjuntos al contrato",
        "contracts.identityDocuments.nothingOnFile": "Nada en archivo",
        "contracts.identityDocuments.loadError": "No se pudieron cargar los documentos",
        "contracts.identityDocuments.unnamedFile": "archivo sin nombre",
      };
      return strings[key] || key;
    },
  }),
}));

import IdentityDocumentsPanel from "../IdentityDocumentsPanel";

const mockToast = vi.fn();
vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({ showToast: mockToast }),
}));

const dniFile = {
  id: 3,
  original_filename: "dni.png",
  mime_type: "image/png",
  size_bytes: 2048,
  preview_url: "/api/v1/identity_documents/3/preview",
  download_url: "/api/v1/identity_documents/3/content",
};

const listing = {
  user_id: 7,
  slots: [
    { kind: "dni", source: "upload", read_only: false, document: dniFile },
    { kind: "rtn", source: "upload", read_only: false, document: null },
  ],
  legacy: [
    {
      kind: null,
      source: "legacy",
      read_only: true,
      document: {
        id: 9,
        original_filename: "adjunto.pdf",
        mime_type: "application/pdf",
        size_bytes: 4096,
        download_url: "/api/v1/contracts/guid-9/legacy_documents/9/content",
      },
    },
  ],
};

const renderPanel = (contract = { guid: "guid-9" }) =>
  render(<IdentityDocumentsPanel contract={contract} />);

beforeEach(() => {
  listIdentityDocuments.mockReset();
  fetchIdentityDocumentBlob.mockReset();
  mockToast.mockReset();
  window.open = vi.fn();
});

// Testing-library's auto cleanup requires global afterEach hooks, which this
// project does not enable, so unmount explicitly between tests.
afterEach(() => {
  cleanup();
});

describe("IdentityDocumentsPanel", () => {
  it("lists the DNI slot with its file, the empty RTN slot and the read-only attachment", async () => {
    listIdentityDocuments.mockResolvedValue({ identity_documents: listing });

    renderPanel();

    await waitFor(() =>
      expect(listIdentityDocuments).toHaveBeenCalledWith("guid-9")
    );
    expect(await screen.findByText("dni.png")).toBeTruthy();
    expect(screen.getByText("Sin documento subido")).toBeTruthy();
    expect(screen.getByText("adjunto.pdf")).toBeTruthy();
    expect(screen.getAllByText("Solo lectura").length).toBe(1);
    // The API was called once; the files are only fetched on demand.
    expect(fetchIdentityDocumentBlob).not.toHaveBeenCalled();
  });

  it("reports an empty listing when the client has nothing on file", async () => {
    listIdentityDocuments.mockResolvedValue({
      identity_documents: {
        user_id: 7,
        slots: [
          { kind: "dni", source: "upload", read_only: false, document: null },
          { kind: "rtn", source: "upload", read_only: false, document: null },
        ],
        legacy: [],
      },
    });

    renderPanel();

    expect(await screen.findAllByText("Sin documento subido")).toHaveLength(2);
    expect(screen.getByText("Nada en archivo")).toBeTruthy();
  });

  it("opens the preview blob in a new tab", async () => {
    listIdentityDocuments.mockResolvedValue({ identity_documents: listing });
    fetchIdentityDocumentBlob.mockResolvedValue(new Blob(["webp"]));

    renderPanel();
    const viewButtons = await screen.findAllByText("Ver");
    viewButtons[0].click();

    await waitFor(() =>
      expect(fetchIdentityDocumentBlob).toHaveBeenCalledWith(
        "/api/v1/identity_documents/3/preview"
      )
    );
    await waitFor(() => expect(window.open).toHaveBeenCalledTimes(1));
  });

  it("hides itself when the caller has no scope (403)", async () => {
    listIdentityDocuments.mockRejectedValue({ status: 403 });

    const { container } = renderPanel();

    await waitFor(() => expect(listIdentityDocuments).toHaveBeenCalled());
    expect(container.textContent).toBe("");
  });

  it("shows a retry button on other errors", async () => {
    listIdentityDocuments.mockRejectedValue(new Error("boom"));

    renderPanel();

    expect(await screen.findByText("Reintentar")).toBeTruthy();
  });
});
