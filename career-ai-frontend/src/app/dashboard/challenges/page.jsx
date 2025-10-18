import { Search, Filter, Clock, Award, TrendingUp } from "lucide-react";

const challenges = [
  {
    id: 1,
    title: "Build a Todo App with React",
    description:
      "Create a fully functional todo application with CRUD operations, local storage, and filtering",
    difficulty: "Intermediate",
    category: "React",
    duration: "2-3 hours",
    points: 150,
    completions: 1234,
  },
  {
    id: 2,
    title: "Design a URL Shortener System",
    description:
      "Design a scalable URL shortening service like bit.ly with high availability",
    difficulty: "Advanced",
    category: "System Design",
    duration: "1-2 hours",
    points: 250,
    completions: 567,
  },
  {
    id: 3,
    title: "Array Methods Mastery",
    description:
      "Practice essential array methods like map, filter, reduce with real-world scenarios",
    difficulty: "Beginner",
    category: "JavaScript",
    duration: "1 hour",
    points: 100,
    completions: 2345,
  },
  {
    id: 4,
    title: "Build a REST API with Node.js",
    description:
      "Create a RESTful API with authentication, validation, and error handling",
    difficulty: "Intermediate",
    category: "Backend",
    duration: "3-4 hours",
    points: 200,
    completions: 890,
  },
  {
    id: 5,
    title: "CSS Grid Layout Challenge",
    description:
      "Build responsive layouts using CSS Grid with various breakpoints",
    difficulty: "Beginner",
    category: "CSS",
    duration: "1-2 hours",
    points: 100,
    completions: 1567,
  },
  {
    id: 6,
    title: "Implement a Chat Application",
    description:
      "Build a real-time chat app with WebSockets, user authentication, and message history",
    difficulty: "Advanced",
    category: "Full Stack",
    duration: "4-6 hours",
    points: 300,
    completions: 345,
  },
];

const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case "Beginner":
      return "bg-success";
    case "Intermediate":
      return "bg-primary";
    case "Advanced":
      return "bg-danger";
    default:
      return "bg-secondary";
  }
};

export default function ChallengesPage() {
  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="mb-4">
        <h1 className="display-4 fw-bold text-dark mb-2">Skill Challenges</h1>
        <p className="text-muted">
          Practice your skills with real-world challenges
        </p>
      </div>

      {/* Stats */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card p-3">
            <div className="d-flex align-items-center">
              <div className="rounded bg-success bg-opacity-10 p-2 me-3">
                <Award className="text-success" size={20} />
              </div>
              <div>
                <div className="h4 fw-bold mb-0">45</div>
                <div className="small text-muted">Completed</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card p-3">
            <div className="d-flex align-items-center">
              <div className="rounded bg-primary bg-opacity-10 p-2 me-3">
                <TrendingUp className="text-primary" size={20} />
              </div>
              <div>
                <div className="h4 fw-bold mb-0">3,450</div>
                <div className="small text-muted">Total Points</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card p-3">
            <div className="d-flex align-items-center">
              <div className="rounded bg-info bg-opacity-10 p-2 me-3">
                <Clock className="text-info" size={20} />
              </div>
              <div>
                <div className="h4 fw-bold mb-0">87h</div>
                <div className="small text-muted">Practice Time</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="row mb-4">
        <div className="col-md-9 mb-2">
          <div className="position-relative">
            <Search
              className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
              size={16}
            />
            <input
              type="text"
              placeholder="Search challenges..."
              className="form-control ps-5"
            />
          </div>
        </div>
        <div className="col-md-3">
          <button className="btn btn-outline-secondary w-100">
            <Filter className="me-2" size={16} />
            Filter
          </button>
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="row">
        {challenges.map((challenge) => (
          <div key={challenge.id} className="col-md-6 mb-4">
            <div
              className="card h-100 shadow-sm border-0"
              style={{ cursor: "pointer" }}
            >
              <div className="card-body">
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="card-title text-primary">
                      {challenge.title}
                    </h5>
                    <span
                      className={`badge ${getDifficultyColor(
                        challenge.difficulty
                      )}`}
                    >
                      {challenge.difficulty}
                    </span>
                  </div>
                  <p className="card-text text-muted small">
                    {challenge.description}
                  </p>
                </div>

                <div className="d-flex flex-wrap gap-2 mb-3">
                  <span className="badge bg-secondary">
                    {challenge.category}
                  </span>
                  <span className="badge bg-light text-dark d-flex align-items-center">
                    <Clock className="me-1" size={12} />
                    {challenge.duration}
                  </span>
                  <span className="badge bg-warning d-flex align-items-center">
                    <Award className="me-1" size={12} />
                    {challenge.points} pts
                  </span>
                </div>

                <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                  <small className="text-muted">
                    {challenge.completions.toLocaleString()} completions
                  </small>
                  <button className="btn btn-primary btn-sm">
                    Start Challenge
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
