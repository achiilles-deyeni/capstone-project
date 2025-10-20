"use client";

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "@/services/api";

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

      {data.html ? (
        <div dangerouslySetInnerHTML={{ __html: data.html }} />
      ) : (
        <pre className="bg-light p-3 rounded">{data.doc}</pre>
      )}
    </div>
  );
}
