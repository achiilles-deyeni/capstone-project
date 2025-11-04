"use client";

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "@/services/api";

// Simple markdown -> structured extractor for our roadmaps.
function parseRoadmapMarkdown(md) {
  if (!md) return null;
  const lines = md.split(/\r?\n/);
  const titleLine = lines.find((l) => l.trim().startsWith("#")) || "";
  const title = titleLine.replace(/^#+\s*/, "").trim();

  // collect top-level bullets (starting with '- ')
  const bullets = lines
    .map((l) => l.trim())
    .filter((l) => l.startsWith("- "))
    .map((l) => l.replace(/^-\s*/, "").trim());

  // collect short paragraphs (non-empty, not headings, not bullets)
  const paragraphs = [];
  let buffer = [];
  for (const l of lines) {
    const t = l.trim();
    if (!t) {
      if (buffer.length) {
        paragraphs.push(buffer.join(" "));
        buffer = [];
      }
      continue;
    }
    if (t.startsWith("#") || t.startsWith("- ")) continue;
    buffer.push(t);
  }
  if (buffer.length) paragraphs.push(buffer.join(" "));

  return { title, bullets, paragraphs };
}

export default function RoadmapDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    API.get(`/api/roadmaps/${id}`)
      .then((res) => {
        if (mounted) setData(res.data);
      })
      .catch((e) => {
        console.error("Failed to load roadmap detail", e);
        if (mounted) setError("Failed to load roadmap");
      });
    return () => (mounted = false);
  }, [id]);

  if (error) {
    return (
      <div className="container-fluid p-3">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container-fluid p-3">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-3">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h2 className="h4 mb-1">{data.title}</h2>
          <div className="text-muted small">{data.summary}</div>
        </div>
        <div>
          <Link to="/dashboard/roadmaps" className="btn btn-outline-secondary">
            Back
          </Link>
        </div>
      </div>

      {/* Render a styled roadmap view when markdown is available */}
      {data.html ? (
        <div dangerouslySetInnerHTML={{ __html: data.html }} />
      ) : data.doc ? (
        (() => {
          const parsed = parseRoadmapMarkdown(data.doc);
          return (
            <div className="row">
              <div className="col-12 mb-3">
                <h3 className="h5">{parsed.title || data.title}</h3>
                {parsed.paragraphs.map((p, i) => (
                  <p key={i} className="text-muted">
                    {p}
                  </p>
                ))}
              </div>

              <div className="col-12">
                <div
                  className="d-flex flex-wrap align-items-start"
                  style={{ gap: 12 }}
                >
                  {/* Left column: related quick links (smaller boxes) */}
                  <div style={{ minWidth: 220 }}>
                    <div
                      style={{
                        border: "2px solid #222",
                        padding: 12,
                        borderRadius: 8,
                        background: "#fff",
                      }}
                    >
                      <h4 className="h6">Related Roadmaps</h4>
                      <ul className="list-unstyled mb-0">
                        {parsed.bullets.slice(0, 4).map((b, i) => (
                          <li key={i} style={{ padding: "6px 0" }}>
                            <span
                              style={{
                                display: "inline-block",
                                width: 10,
                                height: 10,
                                background: "#3ac",
                                borderRadius: 4,
                                marginRight: 8,
                              }}
                            />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Center: vertical stacked boxes representing core areas */}
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                        alignItems: "center",
                      }}
                    >
                      {parsed.bullets.map((b, i) => (
                        <div
                          key={i}
                          style={{
                            background: "#ffef5a",
                            padding: "10px 20px",
                            borderRadius: 6,
                            minWidth: 260,
                            textAlign: "center",
                            boxShadow: "0 2px 0 rgba(0,0,0,0.08)",
                          }}
                        >
                          {b}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: checklist / resources */}
                  <div style={{ minWidth: 260 }}>
                    <div style={{ padding: 12 }}>
                      <h4 className="h6">Checklist & Resources</h4>
                      <div>
                        {parsed.bullets.map((b, i) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "6px 0",
                            }}
                          >
                            <input
                              type="checkbox"
                              disabled
                              style={{ width: 16, height: 16 }}
                            />
                            <div style={{ fontSize: 14 }}>{b}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()
      ) : (
        <pre className="bg-light p-3 rounded">{data.doc}</pre>
      )}
    </div>
  );
}
