import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Award, Target, TrendingUp, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import AIWidget from "@/components/AIWidget";

export default function DashboardPage() {
  const { user } = useUser();
  const firstName =
    user?.firstName ||
    (user?.fullName ? user.fullName.split(" ")[0] : null) ||
    user?.username ||
    "User";

  return (
    <div className="container-fluid p-4">
      {/* Welcome Section */}
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-1">Welcome back, {firstName}!</h1>
        <p className="text-muted">
          Continue your learning journey and achieve your career goals.
        </p>
      </div>

      <div className="mb-4">
        <AIWidget prompt={`Suggest a personalized roadmap for ${firstName}`} />
      </div>

      {/* Stats Grid */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6 col-lg-3">
          <Card>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div
                className="rounded bg-light p-2 d-flex align-items-center justify-content-center"
                style={{ width: 40, height: 40 }}
              >
                <Target size={18} className="text-primary" />
              </div>
              <span className="h4 mb-0">3</span>
            </div>
            <div className="text-muted small">Active Roadmaps</div>
            <div className="text-muted small mt-1">2 in progress</div>
          </Card>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <Card>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div
                className="rounded bg-light p-2 d-flex align-items-center justify-content-center"
                style={{ width: 40, height: 40 }}
              >
                <Award size={18} className="text-success" />
              </div>
              <span className="h4 mb-0">12</span>
            </div>
            <div className="text-muted small">Badges Earned</div>
            <div className="text-muted small mt-1">+3 this month</div>
          </Card>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <Card>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div
                className="rounded bg-light p-2 d-flex align-items-center justify-content-center"
                style={{ width: 40, height: 40 }}
              >
                <TrendingUp size={18} className="text-primary" />
              </div>
              <span className="h4 mb-0">45</span>
            </div>
            <div className="text-muted small">Challenges Done</div>
            <div className="text-muted small mt-1">15 this week</div>
          </Card>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <Card>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div
                className="rounded bg-light p-2 d-flex align-items-center justify-content-center"
                style={{ width: 40, height: 40 }}
              >
                <Zap size={18} className="text-success" />
              </div>
              <span className="h4 mb-0">7</span>
            </div>
            <div className="text-muted small">Day Streak</div>
            <div className="text-muted small mt-1">Keep it up!</div>
          </Card>
        </div>
      </div>

      {/* Current Progress */}
      <div className="row g-3 mb-4">
        <div className="col-lg-6">
          <Card>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h2 className="h5 mb-0">Continue Learning</h2>
              <Link to="/dashboard/roadmaps" className="btn btn-link btn-sm">
                View All <ArrowRight className="ms-1" size={14} />
              </Link>
            </div>

            <div className="mb-3 card p-3">
              <div className="d-flex align-items-start justify-content-between mb-2">
                <div>
                  <h3 className="h6 mb-1">Frontend Developer</h3>
                  <p className="small text-muted mb-0">
                    Master modern web development
                  </p>
                </div>
                <span className="badge bg-success">85%</span>
              </div>
              <Progress value={85} />
              <div className="small text-muted mt-2">
                Next: Advanced React Patterns
              </div>
            </div>

            <div className="card p-3">
              <div className="d-flex align-items-start justify-content-between mb-2">
                <div>
                  <h3 className="h6 mb-1">System Design</h3>
                  <p className="small text-muted mb-0">
                    Build scalable applications
                  </p>
                </div>
                <span className="badge bg-secondary">42%</span>
              </div>
              <Progress value={42} />
              <div className="small text-muted mt-2">Next: Database Design</div>
            </div>
          </Card>
        </div>

        <div className="col-lg-6">
          <Card>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h2 className="h5 mb-0">Recent Achievements</h2>
              <Link to="/dashboard/progress" className="btn btn-link btn-sm">
                View All <ArrowRight className="ms-1" size={14} />
              </Link>
            </div>

            <div className="list-group list-group-flush">
              <div className="list-group-item d-flex align-items-start gap-3">
                <div
                  className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center"
                  style={{ width: 48, height: 48 }}
                >
                  <Award size={20} />
                </div>
                <div className="flex-grow-1">
                  <div className="fw-medium">React Expert</div>
                  <div className="small text-muted">
                    Completed all React challenges
                  </div>
                  <div className="small text-muted mt-1">2 days ago</div>
                </div>
              </div>
              <div className="list-group-item d-flex align-items-start gap-3">
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                  style={{ width: 48, height: 48 }}
                >
                  <Zap size={20} />
                </div>
                <div className="flex-grow-1">
                  <div className="fw-medium">Speed Demon</div>
                  <div className="small text-muted">
                    Completed 10 challenges in one day
                  </div>
                  <div className="small text-muted mt-1">5 days ago</div>
                </div>
              </div>
              <div className="list-group-item d-flex align-items-start gap-3">
                <div
                  className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center"
                  style={{ width: 48, height: 48 }}
                >
                  <Target size={20} />
                </div>
                <div className="flex-grow-1">
                  <div className="fw-medium">Milestone Master</div>
                  <div className="small text-muted">
                    Reached 50% on Frontend path
                  </div>
                  <div className="small text-muted mt-1">1 week ago</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recommended Challenges */}
      <div className="mb-4">
        <h2 className="h5">Recommended Challenges</h2>
        <div className="row g-3 mt-3">
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="badge bg-success">Intermediate</span>
                  <span className="small text-muted">React</span>
                </div>
                <h5 className="card-title">Build a Todo App</h5>
                <p className="card-text text-muted small">
                  Create a fully functional todo application with CRUD
                  operations
                </p>
                <button className="btn btn-outline-primary w-100 mt-3">
                  Start Challenge
                </button>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="badge bg-primary">Advanced</span>
                  <span className="small text-muted">System Design</span>
                </div>
                <h5 className="card-title">Design a URL Shortener</h5>
                <p className="card-text text-muted small">
                  Design a scalable URL shortening service like bit.ly
                </p>
                <button className="btn btn-outline-primary w-100 mt-3">
                  Start Challenge
                </button>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="badge bg-secondary">Beginner</span>
                  <span className="small text-muted">JavaScript</span>
                </div>
                <h5 className="card-title">Array Methods Mastery</h5>
                <p className="card-text text-muted small">
                  Practice essential array methods like map, filter, and reduce
                </p>
                <button className="btn btn-outline-primary w-100 mt-3">
                  Start Challenge
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
