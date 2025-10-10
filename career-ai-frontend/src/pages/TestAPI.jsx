import { useEffect, useState } from "react";
import API from "../services/api";

function TestAPI() {
  const [careers, setCareers] = useState([]);

  useEffect(() => {
    API.get("/api/careers")
      .then((res) => setCareers(res.data))
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  return (
    <div className="container mt-4">
      <h2>Career Paths</h2>
      <ul className="list-group mt-3">
        {careers.map((career) => (
          <li key={career.id} className="list-group-item">
            <strong>{career.title}</strong> — Skills: {career.skills.join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TestAPI;
