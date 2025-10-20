import React, { useEffect, useState } from "react";
import API from "@/services/api";

function Spinner() {
  return (
    <div className="d-flex align-items-center">
      <div
        className="spinner-border spinner-border-sm me-2"
        role="status"
        aria-hidden="true"
      ></div>
      <small className="text-muted">Thinking...</small>
    </div>
  );
}

export default function AIWidget({
  prompt = "Suggest a career roadmap and recommended resources",
}) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchSuggestion() {
      setLoading(true);
      setError(null);
      try {
        const res = await API.post("/api/ai/generate", { prompt });
        if (!mounted) return;
        setData(res.data);
      } catch (e) {
        if (!mounted) return;
        setError("AI service not available — showing fallback suggestions.");
        setData({
          title: "Frontend Developer",
          explanation:
            "Focus on building interactive user interfaces using React and modern tools.",
          average_salary: "$100k",
          youtube_video_recommendation: "https://youtu.be/dummy",
          learning_resources: [
            {
              title: "React Official Tutorial",
              url: "https://react.dev/learn",
              type: "article",
            },
            {
              title: "Free React Course",
              url: "https://example.com/course",
              type: "course",
            },
            {
              title: "Intro to CSS",
              url: "https://example.com/css",
              type: "article",
            },
          ],
        });
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchSuggestion();
    return () => {
      mounted = false;
    };
  }, [prompt]);

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="d-flex align-items-start justify-content-between mb-2">
          <div>
            <div className="small text-muted">AI Suggestion</div>
            <h6 className="mb-1">{loading ? <Spinner /> : data?.title}</h6>
          </div>
          <div className="text-end small text-muted">
            {data?.average_salary}
          </div>
        </div>

        {error && <div className="alert alert-warning small">{error}</div>}

        {!loading && (
          <>
            <p className="small text-muted">{data?.explanation}</p>

            <div className="d-flex gap-2 flex-wrap mb-2">
              <a
                className="btn btn-outline-primary btn-sm"
                href={data?.youtube_video_recommendation}
                target="_blank"
                rel="noreferrer"
              >
                Watch Video
              </a>
              {data?.learning_resources?.slice(0, 3).map((r, i) => (
                <a
                  key={i}
                  className="btn btn-outline-secondary btn-sm"
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {r.title}
                </a>
              ))}
            </div>

            <div className="small text-muted">
              More resources available in the roadmap view.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
