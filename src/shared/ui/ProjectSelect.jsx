import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useLocale } from "@/contexts/LocaleContext";
import useDebounce from "@/hooks/useDebounce";
import { projectsApi } from "@/features/projects/api";

const PAGE_SIZE = 20;

function ProjectSelect({
  value,
  onChange,
  allValue = "All",
  allLabel,
  ariaLabel,
  className = "",
}) {
  const { t } = useLocale();
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const term = useDebounce(search, 400);
  const [projects, setProjects] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState(null);
  const selectedId = selected?.id;

  useEffect(() => {
    if (!open) return undefined;
    let active = true;
    setLoading(true);
    setFailed(false);
    projectsApi
      .list({ page: 1, per_page: PAGE_SIZE, search_term: term })
      .then((data) => {
        if (!active) return;
        setProjects(data?.projects || []);
        setPage(1);
        setTotal(data?.pagination?.total ?? null);
      })
      .catch(() => {
        if (active) setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open, term]);

  useEffect(() => {
    if (!value || value === allValue || selectedId === value) return undefined;
    let active = true;
    projectsApi
      .get(value)
      .then((data) => {
        if (!active) return;
        const project = data?.project || data?.data || data;
        setSelected({ id: value, name: project?.name || t("projectSelect.unknownProject") });
      })
      .catch(() => {
        if (active) setSelected({ id: value, name: t("projectSelect.unknownProject") });
      });
    return () => {
      active = false;
    };
  }, [value, allValue, selectedId, t]);

  useEffect(() => {
    if (!open) return undefined;
    const handlePointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const loadMore = async () => {
    const next = page + 1;
    setLoading(true);
    setFailed(false);
    try {
      const data = await projectsApi.list({
        page: next,
        per_page: PAGE_SIZE,
        search_term: term,
      });
      setProjects((prev) => [...prev, ...(data?.projects || [])]);
      setPage(next);
      setTotal(data?.pagination?.total ?? null);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const choose = (nextValue, name) => {
    if (nextValue !== allValue) setSelected({ id: nextValue, name });
    onChange(nextValue, name);
    setOpen(false);
    setSearch("");
  };

  const optionRefs = useRef([]);

  const optionNodes = () => optionRefs.current.filter(Boolean);

  const focusOption = (index) => {
    const items = optionNodes();
    if (!items.length) return;
    const target = items[Math.min(Math.max(index, 0), items.length - 1)];
    target?.focus();
  };

  const handleOptionKeyDown = (event) => {
    const items = optionNodes();
    const index = items.indexOf(event.currentTarget);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusOption(index + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusOption(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusOption(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusOption(items.length - 1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusOption(0);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusOption(optionNodes().length - 1);
    }
  };

  const hasMore =
    total != null ? projects.length < total : projects.length === page * PAGE_SIZE;

  const label =
    value === allValue
      ? allLabel
      : selected?.id === value
        ? selected.name
        : t("common.loading");

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex h-[38px] min-w-44 items-center justify-between gap-2 rounded-control border border-line bg-surface pl-3 pr-2.5 text-label font-semibold text-ink-2 focus:border-brand focus:outline-hidden"
      >
        <span className="truncate">{label}</span>
        <svg
          className="h-3.5 w-3.5 shrink-0 text-ink-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-1 w-72 rounded-card border border-line bg-surface p-2 shadow-lg">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder={t("projectSelect.search")}
            aria-label={t("projectSelect.search")}
            autoFocus
            className="h-9 w-full rounded-control border border-line-strong bg-surface px-3 text-body text-ink"
          />
          <div role="listbox" aria-label={ariaLabel} className="mt-2 max-h-72 overflow-y-auto">
            <button
              ref={(node) => {
                optionRefs.current[0] = node;
              }}
              type="button"
              role="option"
              aria-selected={value === allValue}
              onClick={() => choose(allValue, allLabel)}
              onKeyDown={handleOptionKeyDown}
              className={`block w-full truncate rounded-chip px-2.5 py-2 text-left text-label font-semibold hover:bg-surface-2 ${value === allValue ? "text-brand-strong" : "text-ink-2"}`}
            >
              {allLabel}
            </button>
            {projects.map((project, index) => (
              <button
                key={project.id}
                ref={(node) => {
                  optionRefs.current[index + 1] = node;
                }}
                type="button"
                role="option"
                aria-selected={value === String(project.id)}
                onClick={() => choose(String(project.id), project.name)}
                onKeyDown={handleOptionKeyDown}
                className={`block w-full truncate rounded-chip px-2.5 py-2 text-left text-label font-semibold hover:bg-surface-2 ${value === String(project.id) ? "text-brand-strong" : "text-ink-2"}`}
              >
                {project.name}
              </button>
            ))}
          </div>
          {!loading && !failed && projects.length === 0 && (
            <p className="px-2.5 py-2 text-body text-ink-3">{t("projectSelect.empty")}</p>
          )}
          {failed && (
            <p role="alert" className="px-2.5 py-2 text-body text-danger">
              {t("projectSelect.loadError")}
            </p>
          )}
          {loading && <p className="px-2.5 py-2 text-body text-ink-3">{t("common.loading")}</p>}
          {!loading && hasMore && projects.length > 0 && (
            <button
              type="button"
              onClick={loadMore}
              className="mt-1 w-full rounded-chip px-2.5 py-2 text-label font-semibold text-brand-strong hover:bg-surface-2"
            >
              {t("projectSelect.loadMore")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

ProjectSelect.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  allValue: PropTypes.string,
  allLabel: PropTypes.node,
  ariaLabel: PropTypes.string,
  className: PropTypes.string,
};

export default ProjectSelect;
