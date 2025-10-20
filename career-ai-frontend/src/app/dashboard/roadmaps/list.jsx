"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import API from "@/services/api";
import { Link } from "react-router-dom";

export default function RoadmapsList() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    API.get("/api/roadmaps")
      .then((res) => {
        if (mounted) setItems(res.data);
      })
      .catch((e) => {
        console.error("Failed to load roadmaps from API", e);
        if (mounted) setError("Failed to load roadmaps");
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    return (
      <div className="container-fluid p-3">
        <h2 className="h4 mb-3">Roadmaps</h2>
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!items) {
    return (
      <div className="container-fluid p-3">
        <h2 className="h4 mb-3">Roadmaps</h2>
        <div>Loading...</div>
      </div>
    );
  }

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
                <Link
                  to={`/dashboard/roadmaps/${it.id}`}
                  className="btn btn-link p-0"
                >
                  Read Summary <ArrowRight size={16} />
                </Link>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
