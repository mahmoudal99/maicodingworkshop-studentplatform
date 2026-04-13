"use client";

import { useState, useCallback, useEffect } from "react";

interface Props {
  onComplete: () => void;
  accent: string;
}

type BlockType = "Header" | "Text" | "Image" | "Button" | "List" | "Footer";
const BLOCK_TYPES: BlockType[] = ["Header", "Text", "Image", "Button", "List", "Footer"];
const BLOCK_ICONS: Record<BlockType, string> = {
  Header: "\u2588\u2588\u2588 Header",
  Text: "\u2592\u2592\u2592 Text block",
  Image: "\u25A1 Image placeholder",
  Button: "[ Button ]",
  List: "\u2022 List items",
  Footer: "\u2500\u2500\u2500 Footer",
};

interface Page {
  name: string;
  blocks: BlockType[];
}

const STORAGE_KEY = "tlp-wireframe";

export default function WireframeBuilder({ onComplete, accent }: Props) {
  const [siteName, setSiteName] = useState("");
  const [siteDesc, setSiteDesc] = useState("");
  const [pages, setPages] = useState<Page[]>([{ name: "Home", blocks: [] }]);
  const [activePage, setActivePage] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Load saved wireframe
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.siteName) setSiteName(data.siteName);
        if (data.siteDesc) setSiteDesc(data.siteDesc);
        if (Array.isArray(data.pages) && data.pages.length > 0) setPages(data.pages);
      }
    } catch {}
    setLoaded(true);
  }, []);

  // Auto-save on changes
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ siteName, siteDesc, pages }));
  }, [siteName, siteDesc, pages, loaded]);

  const addPage = useCallback(() => {
    setPages((prev) => [...prev, { name: `Page ${prev.length + 1}`, blocks: [] }]);
    setActivePage(pages.length);
  }, [pages.length]);

  const removePage = useCallback(
    (idx: number) => {
      if (pages.length <= 1) return;
      setPages((prev) => prev.filter((_, i) => i !== idx));
      if (activePage >= idx && activePage > 0) setActivePage((p) => p - 1);
    },
    [pages.length, activePage]
  );

  const updatePageName = useCallback((idx: number, name: string) => {
    setPages((prev) => prev.map((p, i) => (i === idx ? { ...p, name } : p)));
  }, []);

  const addBlock = useCallback(
    (type: BlockType) => {
      setPages((prev) =>
        prev.map((p, i) => (i === activePage ? { ...p, blocks: [...p.blocks, type] } : p))
      );
    },
    [activePage]
  );

  const removeBlock = useCallback(
    (blockIdx: number) => {
      setPages((prev) =>
        prev.map((p, i) =>
          i === activePage ? { ...p, blocks: p.blocks.filter((_, bi) => bi !== blockIdx) } : p
        )
      );
    },
    [activePage]
  );

  const moveBlock = useCallback(
    (blockIdx: number, dir: -1 | 1) => {
      setPages((prev) =>
        prev.map((p, i) => {
          if (i !== activePage) return p;
          const newIdx = blockIdx + dir;
          if (newIdx < 0 || newIdx >= p.blocks.length) return p;
          const blocks = [...p.blocks];
          [blocks[blockIdx], blocks[newIdx]] = [blocks[newIdx], blocks[blockIdx]];
          return { ...p, blocks };
        })
      );
    },
    [activePage]
  );

  // Completion check
  const totalBlocks = pages.reduce((sum, p) => sum + p.blocks.length, 0);
  const canComplete = siteName.trim().length > 0 && pages.length >= 1 && totalBlocks >= 2;

  const page = pages[activePage] || pages[0];

  return (
    <div className="game-container" style={{ "--game-accent": accent } as React.CSSProperties}>
      <p className="game-instruction">Design your website</p>

      <div className="wfb-form">
        <div className="wfb-field">
          <label className="wfb-label">Site name</label>
          <input
            className="wfb-input"
            placeholder="My Awesome Site"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
          />
        </div>

        <div className="wfb-field">
          <label className="wfb-label">What is it about?</label>
          <textarea
            className="wfb-textarea"
            placeholder="A site about..."
            value={siteDesc}
            onChange={(e) => setSiteDesc(e.target.value)}
          />
        </div>

        {/* Page tabs */}
        <div className="wfb-pages-header">
          <span className="wfb-label">Pages</span>
          <button className="wfb-add-btn" onClick={addPage} type="button">
            + Add page
          </button>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {pages.map((p, i) => (
            <button
              key={i}
              type="button"
              className="wfb-chip"
              style={
                i === activePage
                  ? { borderColor: accent, color: "var(--text)", background: `${accent}15` }
                  : undefined
              }
              onClick={() => setActivePage(i)}
            >
              {p.name || `Page ${i + 1}`}
            </button>
          ))}
        </div>

        {/* Active page editor */}
        <div className="wfb-page-card">
          <div className="wfb-page-header">
            <input
              className="wfb-input"
              style={{ fontSize: 13, padding: "6px 10px" }}
              value={page.name}
              onChange={(e) => updatePageName(activePage, e.target.value)}
              placeholder="Page name"
            />
            {pages.length > 1 && (
              <button
                className="wfb-remove-btn"
                onClick={() => removePage(activePage)}
                type="button"
              >
                x
              </button>
            )}
          </div>

          {/* Block palette */}
          <div>
            <span className="wfb-label">Add blocks</span>
            <div className="wfb-palette" style={{ marginTop: 4 }}>
              {BLOCK_TYPES.map((type) => (
                <button
                  key={type}
                  className="wfb-chip"
                  onClick={() => addBlock(type)}
                  type="button"
                >
                  + {type}
                </button>
              ))}
            </div>
          </div>

          {/* Block list */}
          <div className="wfb-blocks">
            {page.blocks.length === 0 && (
              <p style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", padding: "12px 0" }}>
                Click blocks above to build your page layout
              </p>
            )}
            {page.blocks.map((block, bi) => (
              <div key={bi} className="wfb-block">
                <span>{BLOCK_ICONS[block]}</span>
                <span className="wfb-block-actions">
                  <button onClick={() => moveBlock(bi, -1)} type="button">
                    {"\u2191"}
                  </button>
                  <button onClick={() => moveBlock(bi, 1)} type="button">
                    {"\u2193"}
                  </button>
                  <button onClick={() => removeBlock(bi)} type="button">
                    x
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Complete */}
        <button
          className="game-btn"
          style={{
            background: canComplete ? accent : "var(--bg3)",
            color: canComplete ? "#0a0e1a" : "var(--muted)",
            cursor: canComplete ? "pointer" : "not-allowed",
            width: "100%",
          }}
          onClick={() => canComplete && onComplete()}
          disabled={!canComplete}
          type="button"
        >
          {canComplete ? "Complete" : "Add a name, 1 page, and 2+ blocks"}
        </button>
      </div>
    </div>
  );
}
