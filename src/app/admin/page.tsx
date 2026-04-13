"use client";

import { useEffect, useState, useCallback } from "react";

const WEEK_LABELS = [
  "Week 1 — How Computers Think",
  "Week 2 — Problem Solving",
  "Week 3 — JavaScript Basics",
  "Week 4 — Functions & Logic",
  "Week 5 — Build Your Site",
  "Week 6 — Launch & Reflect",
];

interface ResourceLink {
  label: string;
  url: string;
  icon: string;
}

interface GlobalResource {
  icon: string;
  title: string;
  desc: string;
  tag: string;
  url: string;
}

type Tab = "weeks" | "week-links" | "global-resources";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState("");
  const [weeks, setWeeks] = useState<boolean[]>([true, false, false, false, false, false]);
  const [weekLinks, setWeekLinks] = useState<Record<string, ResourceLink[]>>({});
  const [globalResources, setGlobalResources] = useState<GlobalResource[]>([]);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [tab, setTab] = useState<Tab>("weeks");
  const [selectedWeek, setSelectedWeek] = useState(1);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.unlockedWeeks)) {
          setWeeks([1, 2, 3, 4, 5, 6].map((w) => data.unlockedWeeks.includes(w)));
        }
        if (data.weekLinks && typeof data.weekLinks === "object") {
          setWeekLinks(data.weekLinks);
        }
        if (Array.isArray(data.globalResources)) {
          setGlobalResources(data.globalResources);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogin = useCallback(async () => {
    setError("");
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, unlockedWeeks: [1] }),
      });
      if (res.ok) {
        setAuthed(true);
        const data = await fetch("/api/settings").then((r) => r.json());
        if (Array.isArray(data.unlockedWeeks)) {
          setWeeks([1, 2, 3, 4, 5, 6].map((w) => data.unlockedWeeks.includes(w)));
        }
        if (data.weekLinks && typeof data.weekLinks === "object") {
          setWeekLinks(data.weekLinks);
        }
        if (Array.isArray(data.globalResources)) {
          setGlobalResources(data.globalResources);
        }
      } else {
        setError("Wrong password");
      }
    } catch {
      setError("Connection error");
    }
  }, [password]);

  const saveAll = useCallback(async () => {
    setSaving(true);
    setFeedback("");
    const unlockedWeeks = weeks
      .map((on, i) => (on ? i + 1 : null))
      .filter((w): w is number => w !== null);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, unlockedWeeks, weekLinks, globalResources }),
      });
      if (res.ok) {
        const data = await res.json();
        setWeeks([1, 2, 3, 4, 5, 6].map((w) => data.unlockedWeeks.includes(w)));
        if (data.weekLinks) setWeekLinks(data.weekLinks);
        if (data.globalResources) setGlobalResources(data.globalResources);
        setFeedback("Saved!");
        setTimeout(() => setFeedback(""), 2000);
      } else {
        setFeedback("Save failed");
      }
    } catch {
      setFeedback("Connection error");
    }
    setSaving(false);
  }, [password, weeks, weekLinks, globalResources]);

  const toggleWeek = (index: number) => {
    if (index === 0) return;
    setWeeks((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  // ── Week link helpers ──
  const currentLinks = weekLinks[String(selectedWeek)] ?? [];

  const updateWeekLink = (idx: number, field: keyof ResourceLink, value: string) => {
    setWeekLinks((prev) => {
      const key = String(selectedWeek);
      const list = [...(prev[key] ?? [])];
      list[idx] = { ...list[idx], [field]: value };
      return { ...prev, [key]: list };
    });
  };

  const addWeekLink = () => {
    setWeekLinks((prev) => {
      const key = String(selectedWeek);
      return { ...prev, [key]: [...(prev[key] ?? []), { label: "", url: "", icon: "🔗" }] };
    });
  };

  const removeWeekLink = (idx: number) => {
    setWeekLinks((prev) => {
      const key = String(selectedWeek);
      const list = [...(prev[key] ?? [])];
      list.splice(idx, 1);
      return { ...prev, [key]: list };
    });
  };

  // ── Global resource helpers ──
  const updateGlobalResource = (idx: number, field: keyof GlobalResource, value: string) => {
    setGlobalResources((prev) => {
      const list = [...prev];
      list[idx] = { ...list[idx], [field]: value };
      return list;
    });
  };

  const addGlobalResource = () => {
    setGlobalResources((prev) => [
      ...prev,
      { icon: "📚", title: "", desc: "", tag: "", url: "" },
    ]);
  };

  const removeGlobalResource = (idx: number) => {
    setGlobalResources((prev) => {
      const list = [...prev];
      list.splice(idx, 1);
      return list;
    });
  };

  if (!authed) {
    return (
      <div className="admin-page">
        <div className="admin-login">
          <h1 className="admin-title">Admin Access</h1>
          <p className="admin-sub">Enter the admin password to manage the workshop.</p>
          <input
            type="password"
            className="admin-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          {error && <p className="admin-error">{error}</p>}
          <button className="admin-btn" onClick={handleLogin} type="button">
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-panel" style={{ maxWidth: 700 }}>
        <h1 className="admin-title">Workshop Admin</h1>

        {/* Tab bar */}
        <div className="admin-tabs">
          {([
            ["weeks", "Week Unlocks"],
            ["week-links", "Week Links"],
            ["global-resources", "Global Resources"],
          ] as [Tab, string][]).map(([t, label]) => (
            <button
              key={t}
              className={`admin-tab${tab === t ? " admin-tab-active" : ""}`}
              onClick={() => setTab(t)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>

        {/* ─── Tab: Week Unlocks ─── */}
        {tab === "weeks" && (
          <>
            <p className="admin-sub">
              Toggle which weeks students can access. Week 1 is always available.
            </p>
            <div className="admin-weeks">
              {WEEK_LABELS.map((label, i) => (
                <div
                  key={i}
                  className={`admin-week-row${weeks[i] ? " admin-week-on" : ""}`}
                  onClick={() => toggleWeek(i)}
                >
                  <div className={`admin-toggle${weeks[i] ? " admin-toggle-on" : ""}`}>
                    <div className="admin-toggle-knob" />
                  </div>
                  <span className="admin-week-label">{label}</span>
                  {i === 0 && <span className="admin-always-on">Always on</span>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ─── Tab: Week Links ─── */}
        {tab === "week-links" && (
          <>
            <p className="admin-sub">
              Manage resource links shown on each week&apos;s page. Select a week, then add or remove links.
            </p>
            <div className="admin-week-select">
              {[1, 2, 3, 4, 5, 6].map((w) => (
                <button
                  key={w}
                  className={`admin-week-pill${selectedWeek === w ? " admin-week-pill-active" : ""}`}
                  onClick={() => setSelectedWeek(w)}
                  type="button"
                >
                  W{w}
                </button>
              ))}
            </div>

            <div className="admin-resource-list">
              {currentLinks.length === 0 && (
                <p className="admin-empty">No links for Week {selectedWeek} yet.</p>
              )}
              {currentLinks.map((link, i) => (
                <div key={i} className="admin-resource-item">
                  <div className="admin-resource-row">
                    <input
                      className="admin-res-input admin-res-icon"
                      value={link.icon}
                      onChange={(e) => updateWeekLink(i, "icon", e.target.value)}
                      placeholder="Icon"
                    />
                    <input
                      className="admin-res-input admin-res-grow"
                      value={link.label}
                      onChange={(e) => updateWeekLink(i, "label", e.target.value)}
                      placeholder="Label"
                    />
                    <button
                      className="admin-res-remove"
                      onClick={() => removeWeekLink(i)}
                      type="button"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                  <input
                    className="admin-res-input admin-res-full"
                    value={link.url}
                    onChange={(e) => updateWeekLink(i, "url", e.target.value)}
                    placeholder="URL (https://...)"
                  />
                </div>
              ))}
              <button className="admin-res-add" onClick={addWeekLink} type="button">
                + Add Link
              </button>
            </div>
          </>
        )}

        {/* ─── Tab: Global Resources ─── */}
        {tab === "global-resources" && (
          <>
            <p className="admin-sub">
              Manage the &quot;Keep Learning&quot; resources shown on the resources page.
            </p>

            <div className="admin-resource-list">
              {globalResources.length === 0 && (
                <p className="admin-empty">No global resources yet.</p>
              )}
              {globalResources.map((res, i) => (
                <div key={i} className="admin-resource-item">
                  <div className="admin-resource-row">
                    <input
                      className="admin-res-input admin-res-icon"
                      value={res.icon}
                      onChange={(e) => updateGlobalResource(i, "icon", e.target.value)}
                      placeholder="Icon"
                    />
                    <input
                      className="admin-res-input admin-res-grow"
                      value={res.title}
                      onChange={(e) => updateGlobalResource(i, "title", e.target.value)}
                      placeholder="Title"
                    />
                    <button
                      className="admin-res-remove"
                      onClick={() => removeGlobalResource(i)}
                      type="button"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                  <input
                    className="admin-res-input admin-res-full"
                    value={res.desc}
                    onChange={(e) => updateGlobalResource(i, "desc", e.target.value)}
                    placeholder="Description"
                  />
                  <div className="admin-resource-row">
                    <input
                      className="admin-res-input admin-res-grow"
                      value={res.url}
                      onChange={(e) => updateGlobalResource(i, "url", e.target.value)}
                      placeholder="URL (https://...)"
                    />
                    <input
                      className="admin-res-input"
                      style={{ width: 160 }}
                      value={res.tag}
                      onChange={(e) => updateGlobalResource(i, "tag", e.target.value)}
                      placeholder="Tag"
                    />
                  </div>
                </div>
              ))}
              <button className="admin-res-add" onClick={addGlobalResource} type="button">
                + Add Resource
              </button>
            </div>
          </>
        )}

        {/* Save bar */}
        <div className="admin-actions">
          <button
            className="admin-save-btn"
            onClick={saveAll}
            disabled={saving}
            type="button"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {feedback && (
            <span className={`admin-feedback${feedback === "Saved!" ? " admin-feedback-ok" : ""}`}>
              {feedback}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
