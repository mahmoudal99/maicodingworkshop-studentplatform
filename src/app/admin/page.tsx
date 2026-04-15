"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@/lib/store";
import {
  LEGACY_PROGRESS_STORAGE_KEY,
  getProgressStorageKey,
} from "@/lib/progress";
import {
  LEGACY_STREAK_STORAGE_KEY,
  getStreakStorageKey,
} from "@/lib/streak";

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

interface StudentEntry {
  userId: string;
  userName: string;
  versionKey: "A" | "B";
  totalXp: number;
  weeklyXp: number;
  streak: number;
  completedCount: number;
  currentWeek: number;
  updatedAt: string;
}

type Tab = "weeks" | "week-links" | "global-resources" | "students";

export default function AdminPage() {
  const { userId } = useUser();
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState("");
  const [weeks, setWeeks] = useState<boolean[]>([true, false, false, false, false, false]);
  const [weekLinks, setWeekLinks] = useState<Record<string, ResourceLink[]>>({});
  const [globalResources, setGlobalResources] = useState<GlobalResource[]>([]);
  const [resourcesUnlocked, setResourcesUnlocked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [tab, setTab] = useState<Tab>("weeks");
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [students, setStudents] = useState<StudentEntry[]>([]);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  const loadAdminState = useCallback(async () => {
    const [settingsData, leaderboardData] = await Promise.all([
      fetch("/api/settings").then((r) => r.json()),
      fetch("/api/leaderboard", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ entries: [] })),
    ]);

    if (Array.isArray(settingsData.unlockedWeeks)) {
      setWeeks([1, 2, 3, 4, 5, 6].map((w) => settingsData.unlockedWeeks.includes(w)));
    }
    if (settingsData.weekLinks && typeof settingsData.weekLinks === "object") {
      setWeekLinks(settingsData.weekLinks);
    }
    if (Array.isArray(settingsData.globalResources)) {
      setGlobalResources(settingsData.globalResources);
    }
    if (typeof settingsData.resourcesUnlocked === "boolean") {
      setResourcesUnlocked(settingsData.resourcesUnlocked);
    }
    if (Array.isArray(leaderboardData.entries)) {
      setStudents(leaderboardData.entries);
    }
  }, []);

  useEffect(() => {
    loadAdminState().catch(() => {});
  }, [loadAdminState]);

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
        await loadAdminState();
      } else {
        setError("Wrong password");
      }
    } catch {
      setError("Connection error");
    }
  }, [loadAdminState, password]);

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
        body: JSON.stringify({ password, unlockedWeeks, weekLinks, globalResources, resourcesUnlocked }),
      });
      if (res.ok) {
        const data = await res.json();
        setWeeks([1, 2, 3, 4, 5, 6].map((w) => data.unlockedWeeks.includes(w)));
        if (data.weekLinks) setWeekLinks(data.weekLinks);
        if (data.globalResources) setGlobalResources(data.globalResources);
        if (typeof data.resourcesUnlocked === "boolean") setResourcesUnlocked(data.resourcesUnlocked);
        setFeedback("Saved!");
        setTimeout(() => setFeedback(""), 2000);
      } else {
        setFeedback("Save failed");
      }
    } catch {
      setFeedback("Connection error");
    }
    setSaving(false);
  }, [password, weeks, weekLinks, globalResources, resourcesUnlocked]);

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

  const handleDeleteStudent = useCallback(
    async (student: StudentEntry) => {
      const deletingCurrentUser = student.userId === userId;
      const confirmed = window.confirm(
        deletingCurrentUser
          ? `Delete ${student.userName} and clear this browser's student profile?`
          : `Delete ${student.userName} from the class leaderboard?`
      );

      if (!confirmed) return;

      setRemovingUserId(student.userId);
      setFeedback("");

      try {
        const res = await fetch("/api/leaderboard", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, userId: student.userId }),
        });

        if (!res.ok) {
          setFeedback("Delete failed");
          return;
        }

        const data = await res.json();
        if (Array.isArray(data.entries)) {
          setStudents(data.entries);
        } else {
          setStudents((prev) => prev.filter((entry) => entry.userId !== student.userId));
        }

        setFeedback(deletingCurrentUser ? "Profile removed from this device." : "Student removed.");

        if (deletingCurrentUser && typeof window !== "undefined") {
          window.localStorage.removeItem("tlp-user");
          window.localStorage.removeItem(LEGACY_PROGRESS_STORAGE_KEY);
          window.localStorage.removeItem(getProgressStorageKey(student.userId));
          window.localStorage.removeItem(LEGACY_STREAK_STORAGE_KEY);
          window.localStorage.removeItem(getStreakStorageKey(student.userId));
          window.localStorage.removeItem("tlp-wireframe");
          window.location.replace("/");
          return;
        }

        window.setTimeout(() => setFeedback(""), 2200);
      } catch {
        setFeedback("Connection error");
      } finally {
        setRemovingUserId(null);
      }
    },
    [password, userId]
  );

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
            ["students", "Students"],
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

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 12, paddingTop: 12 }}>
                <div
                  className={`admin-week-row${resourcesUnlocked ? " admin-week-on" : ""}`}
                  onClick={() => setResourcesUnlocked((v) => !v)}
                >
                  <div className={`admin-toggle${resourcesUnlocked ? " admin-toggle-on" : ""}`}>
                    <div className="admin-toggle-knob" />
                  </div>
                  <span className="admin-week-label">Resources Page</span>
                </div>
              </div>
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

        {tab === "students" && (
          <>
            <p className="admin-sub">
              Remove students from the shared class leaderboard. Deleting the current device profile also clears this browser's saved student data.
            </p>

            <div className="admin-student-list">
              {students.length === 0 && <p className="admin-empty">No students on the leaderboard yet.</p>}
              {students.map((student, index) => {
                const isCurrentUser = student.userId === userId;

                return (
                  <div key={student.userId} className="admin-student-item">
                    <div className="admin-student-rank">#{index + 1}</div>
                    <div className="admin-student-copy">
                      <strong>
                        {student.userName}
                        {isCurrentUser ? " (This device)" : ""}
                      </strong>
                      <span>
                        {student.weeklyXp} XP this week · {student.streak} day streak · Week {student.currentWeek}
                      </span>
                    </div>
                    <button
                      className="admin-student-delete"
                      onClick={() => handleDeleteStudent(student)}
                      type="button"
                      disabled={removingUserId === student.userId}
                    >
                      {removingUserId === student.userId ? "Removing..." : "Delete"}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Save bar */}
        {tab !== "students" && (
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
        )}
        {tab === "students" && feedback && (
          <div className="admin-actions">
            <span className={`admin-feedback${feedback.includes("removed") ? " admin-feedback-ok" : ""}`}>
              {feedback}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
