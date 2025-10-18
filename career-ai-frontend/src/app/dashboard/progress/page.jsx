import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Award,
  TrendingUp,
  Target,
  Calendar,
  CheckCircle2,
} from "lucide-react";

export default function ProgressPage() {
  return (
    <div className="container-fluid p-4">
      <div className="mb-3">
        <h1 className="h3 fw-bold mb-1">Your Progress</h1>
        <p className="text-muted">
          Track your learning journey and achievements
        </p>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6 col-lg-3">
          <Card>
            <div className="d-flex align-items-center mb-2">
              <div
                className="rounded bg-light p-2 d-flex align-items-center justify-content-center"
                style={{ width: 40, height: 40 }}
              >
                <CheckCircle2 size={18} className="text-success" />
              </div>
            </div>
            <div className="h4 mb-0">156</div>
            <div className="small text-muted">Skills Learned</div>
            <div className="small text-success mt-2">+12 this month</div>
          </Card>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <Card>
            <div className="d-flex align-items-center mb-2">
              <div
                className="rounded bg-light p-2 d-flex align-items-center justify-content-center"
                style={{ width: 40, height: 40 }}
              >
                <TrendingUp size={18} className="text-primary" />
              </div>
            </div>
            <div className="h4 mb-0">3,450</div>
            <div className="small text-muted">Total Points</div>
            <div className="small text-muted mt-2">Top 15%</div>
          </Card>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <Card>
            <div className="d-flex align-items-center mb-2">
              <div
                className="rounded bg-light p-2 d-flex align-items-center justify-content-center"
                style={{ width: 40, height: 40 }}
              >
                <Award size={18} className="text-success" />
              </div>
            </div>
            <div className="h4 mb-0">12</div>
            <div className="small text-muted">Badges Earned</div>
            <div className="small text-success mt-2">3 new</div>
          </Card>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <Card>
            <div className="d-flex align-items-center mb-2">
              <div
                className="rounded bg-light p-2 d-flex align-items-center justify-content-center"
                style={{ width: 40, height: 40 }}
              >
                <Calendar size={18} className="text-primary" />
              </div>
            </div>
            <div className="h4 mb-0">7</div>
            <div className="small text-muted">Day Streak</div>
            <div className="small text-muted mt-2">Keep going!</div>
          </Card>
        </div>
      </div>

      <Card>
        <h2 className="h5 mb-3">Learning Progress</h2>
        <div className="mb-3">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div>
              <div className="fw-medium">Frontend Developer</div>
              <div className="small text-muted">
                Master modern web development
              </div>
            </div>
            <div className="small">85%</div>
          </div>
          <Progress value={85} />
          <div className="small text-muted mt-2">34 of 40 skills completed</div>
        </div>

        <div className="mb-3">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div>
              <div className="fw-medium">System Design</div>
              <div className="small text-muted">
                Build scalable applications
              </div>
            </div>
            <div className="small">42%</div>
          </div>
          <Progress value={42} />
          <div className="small text-muted mt-2">13 of 31 skills completed</div>
        </div>

        <div>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div>
              <div className="fw-medium">Backend Development</div>
              <div className="small text-muted">Server-side programming</div>
            </div>
            <div className="small">18%</div>
          </div>
          <Progress value={18} />
          <div className="small text-muted mt-2">7 of 38 skills completed</div>
        </div>
      </Card>

      <Card>
        <h2 className="h5 mb-3">Recent Activity</h2>
        <div className="list-group list-group-flush">
          <div className="list-group-item d-flex gap-3">
            <div
              className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center"
              style={{ width: 40, height: 40 }}
            >
              <CheckCircle2 size={18} />
            </div>
            <div>
              <div className="fw-medium">Completed "Build a Todo App"</div>
              <div className="small text-muted">
                Earned 150 points and React Expert badge
              </div>
              <div className="small text-muted mt-1">2 hours ago</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
