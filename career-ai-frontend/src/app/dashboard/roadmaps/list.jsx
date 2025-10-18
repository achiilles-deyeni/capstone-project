"use client";

import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import roadmaps from "@/data/roadmaps.json";

console.debug("roadmaps (module):", roadmaps);

export default function RoadmapsList() {
  const items = roadmaps || [];

  if (!items.length) {
    return (
      <div className="container-fluid p-3">
        <h2 className="h4 mb-3">Roadmaps</h2>
        <div className="alert alert-warning">No roadmaps available.</div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-3">
      <h2 className="h4 mb-3">Roadmaps</h2>
      <div className="row g-3">
        {items.map((it) => (
          <div key={it.id} className="col-12 col-md-6 col-lg-4">
            <Card>
              <h3 className="h6">{it.title}</h3>
              <p className="small text-muted">{it.summary}</p>
              <div className="d-flex justify-content-end">
                <a
                  className="btn btn-link p-0"
                  href={it.doc}
                  target="_blank"
                  rel="noreferrer"
                >
                  Read Summary <ArrowRight size={16} />
                </a>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
