import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import en from "../../locales/en.json";
import { ProjectSelect } from "@/shared/ui";
import { projectsApi } from "@/features/projects/api";

expect.extend(matchers);

const getValue = (object, path) =>
  path.split(".").reduce((current, key) => current?.[key], object);

const t = (key, params = {}) => {
  const value = getValue(en, key) ?? key;
  return Object.entries(params).reduce(
    (text, [name, replacement]) =>
      text.replaceAll(`{${name}}`, String(replacement)),
    value
  );
};

vi.mock("@/contexts/LocaleContext", () => ({
  useLocale: () => ({ t, locale: "en" }),
}));

vi.mock("@/features/projects/api", () => ({
  projectsApi: { list: vi.fn(), get: vi.fn() },
}));

const pageOf = (start, count, total) => ({
  projects: Array.from({ length: count }, (_, index) => ({
    id: start + index,
    name: `Project ${start + index}`,
  })),
  pagination: { total },
});

const renderSelect = (props = {}) => {
  const onChange = vi.fn();
  render(
    <ProjectSelect
      value="All"
      onChange={onChange}
      allLabel="All projects"
      ariaLabel="Project filter"
      {...props}
    />
  );
  return { onChange };
};

const openSelect = () =>
  fireEvent.click(screen.getByRole("button", { name: "Project filter" }));

beforeEach(() => {
  projectsApi.list.mockReset();
  projectsApi.get.mockReset();
  projectsApi.list.mockResolvedValue(pageOf(1, 20, 25));
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ProjectSelect", () => {
  it("loads 20 projects at a time and appends the next page on load more", async () => {
    renderSelect();

    openSelect();

    expect(await screen.findByRole("option", { name: "Project 1" })).toBeInTheDocument();
    expect(projectsApi.list).toHaveBeenCalledWith({
      page: 1,
      per_page: 20,
      search_term: "",
    });

    projectsApi.list.mockResolvedValueOnce(pageOf(21, 5, 25));
    fireEvent.click(screen.getByRole("button", { name: "Load more" }));

    expect(await screen.findByRole("option", { name: "Project 21" })).toBeInTheDocument();
    expect(projectsApi.list).toHaveBeenLastCalledWith({
      page: 2,
      per_page: 20,
      search_term: "",
    });
    expect(screen.getByRole("option", { name: "Project 1" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Load more" })).not.toBeInTheDocument();
  });

  it("searches on the server after a 400 ms pause in typing", async () => {
    renderSelect();
    openSelect();
    await screen.findByRole("option", { name: "Project 1" });

    fireEvent.change(screen.getByRole("searchbox", { name: "Search projects" }), {
      target: { value: "alt" },
    });

    expect(projectsApi.list).not.toHaveBeenCalledWith(
      expect.objectContaining({ search_term: "alt" })
    );

    await waitFor(() =>
      expect(projectsApi.list).toHaveBeenCalledWith({
        page: 1,
        per_page: 20,
        search_term: "alt",
      })
    );
  });

  it("keeps the selected project name when it is outside the loaded page", async () => {
    projectsApi.get.mockResolvedValue({ project: { id: 42, name: "Lomas del Sur" } });

    renderSelect({ value: "42" });

    expect(await screen.findByText("Lomas del Sur")).toBeInTheDocument();
    expect(projectsApi.get).toHaveBeenCalledWith("42");
    expect(projectsApi.list).not.toHaveBeenCalled();
  });

  it("reports the chosen project id and name", async () => {
    const { onChange } = renderSelect();
    openSelect();

    fireEvent.click(await screen.findByRole("option", { name: "Project 3" }));

    expect(onChange).toHaveBeenCalledWith("3", "Project 3");
  });

  it("reports the all option without a project", async () => {
    projectsApi.get.mockResolvedValue({ project: { id: 3, name: "Project 3" } });
    const { onChange } = renderSelect({ value: "3" });
    await screen.findByText("Project 3");
    openSelect();

    fireEvent.click(await screen.findByRole("option", { name: "All projects" }));

    expect(onChange).toHaveBeenCalledWith("All", "All projects");
  });

  it("never asks for 100 projects", async () => {
    renderSelect();
    openSelect();
    await screen.findByRole("option", { name: "Project 1" });

    const requested = projectsApi.list.mock.calls.map(([params]) => params.per_page);
    expect(requested.every((size) => size === 20)).toBe(true);
  });

  it("moves focus with the arrow keys from the search field and selects with Enter", async () => {
    const user = userEvent.setup();
    const { onChange } = renderSelect();
    openSelect();

    const search = await screen.findByRole("searchbox", { name: "Search projects" });
    await screen.findByRole("option", { name: "Project 1" });
    search.focus();

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("option", { name: "All projects" })).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("option", { name: "Project 1" })).toHaveFocus();

    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(screen.getByRole("option", { name: "Project 3" })).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith("3", "Project 3");
  });

  it("keeps focus inside the options with ArrowUp, Home and End", async () => {
    const user = userEvent.setup();
    renderSelect();
    openSelect();

    const search = await screen.findByRole("searchbox", { name: "Search projects" });
    await screen.findByRole("option", { name: "Project 1" });
    search.focus();

    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("option", { name: "Project 20" })).toHaveFocus();

    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("option", { name: "Project 19" })).toHaveFocus();

    await user.keyboard("{Home}");
    expect(screen.getByRole("option", { name: "All projects" })).toHaveFocus();

    await user.keyboard("{End}");
    expect(screen.getByRole("option", { name: "Project 20" })).toHaveFocus();
  });

  it("selects the focused option with Space", async () => {
    const user = userEvent.setup();
    const { onChange } = renderSelect();
    openSelect();

    const search = await screen.findByRole("searchbox", { name: "Search projects" });
    await screen.findByRole("option", { name: "Project 1" });
    search.focus();

    await user.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}");
    expect(screen.getByRole("option", { name: "Project 2" })).toHaveFocus();

    await user.keyboard(" ");
    expect(onChange).toHaveBeenCalledWith("2", "Project 2");
  });

  it("closes the popover with Escape", async () => {
    const user = userEvent.setup();
    renderSelect();
    openSelect();

    await screen.findByRole("searchbox", { name: "Search projects" });
    await user.keyboard("{ArrowDown}{ArrowDown}{Escape}");

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("searchbox", { name: "Search projects" })
    ).not.toBeInTheDocument();
  });
});
