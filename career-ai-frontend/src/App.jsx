import ClerkProviderWithRoutes from "./auth/ClerkProviderWithRoutes.jsx";
import { Routes, Route } from "react-router-dom";
import { AuthenticationPage } from "./auth/AuthenticationPage.jsx";
import Layout from "./app/dashboard/layout.jsx";
import DashboardHome from "./app/dashboard/page.jsx";
import ChallengeGenerator from "./app/dashboard/challenges/page.jsx";
import RoadmapsPage from "./app/dashboard/roadmaps/page.jsx";
import ProgressPage from "./app/dashboard/progress/page.jsx";
import ProfilePage from "./app/dashboard/profile/page.jsx";
import RoadmapDetail from "./app/dashboard/roadmaps/[id]/page.jsx";
import AIChatPage from "./app/dashboard/ai-chat/page.jsx";
import "./App.css";

import { Link } from "react-router-dom";
import {
  ArrowRight,
  Target,
  TrendingUp,
  Award,
  Zap,
  BookOpen,
} from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function LandingPage() {
  return (
    <div className="min-vh-100 bg-light">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top">
        <div className="container-fluid">
          <Link
            to="/"
            className="navbar-brand d-flex align-items-center text-decoration-none"
          >
            <Target className="text-primary me-2" size={24} />
            <span className="fw-bold text-dark">CareerPath</span>
          </Link>

          <div className="d-flex align-items-center gap-2">
            {CLERK_PUBLISHABLE_KEY ? (
              <>
                <SignedOut>
                  <Link to="/sign-in" className="btn btn-outline-primary me-2">
                    Sign In
                  </Link>
                  <Link to="/sign-up" className="btn btn-primary">
                    Get Started
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link to="/dashboard" className="btn btn-primary me-2">
                    Dashboard
                  </Link>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              </>
            ) : (
              // Fallback links when Clerk is not configured in dev
              <>
                <Link to="/sign-in" className="btn btn-outline-primary me-2">
                  Sign In
                </Link>
                <Link to="/sign-up" className="btn btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container-fluid py-5">
        <div className="row align-items-center py-5">
          <div className="col-lg-6 mb-5 mb-lg-0">
            <h1 className="display-2 fw-bold text-dark mb-4">
              Navigate your career with confidence.
            </h1>
            <p className="lead text-muted mb-4">
              Your personalized roadmap to career success. Build skills, track
              progress, and achieve your professional goals with structured
              guidance.
            </p>
            <div className="d-flex flex-wrap gap-3">
              {CLERK_PUBLISHABLE_KEY ? (
                <>
                  <SignedOut>
                    <Link to="/sign-up" className="btn btn-primary btn-lg">
                      Explore Roadmaps <ArrowRight className="ms-2" size={16} />
                    </Link>
                    <button className="btn btn-outline-secondary btn-lg">
                      View Demo
                    </button>
                  </SignedOut>
                  <SignedIn>
                    <Link to="/dashboard" className="btn btn-primary btn-lg">
                      Go to Dashboard <ArrowRight className="ms-2" size={16} />
                    </Link>
                  </SignedIn>
                </>
              ) : (
                <>
                  <Link to="/sign-up" className="btn btn-primary btn-lg">
                    Explore Roadmaps <ArrowRight className="ms-2" size={16} />
                  </Link>
                  <button className="btn btn-outline-secondary btn-lg">
                    View Demo
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="col-lg-6">
            <div className="card shadow-lg border-0 p-4">
              <div className="card-body">
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex align-items-center gap-3 p-3 bg-success bg-opacity-10 border border-success border-opacity-25 rounded">
                    <div
                      className="d-flex align-items-center justify-content-center bg-success rounded-circle"
                      style={{ width: "40px", height: "40px" }}
                    >
                      <Award size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="fw-semibold">Frontend Developer</div>
                      <div className="text-muted small">85% Complete</div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3 p-3 bg-warning bg-opacity-10 border border-warning border-opacity-25 rounded">
                    <div
                      className="d-flex align-items-center justify-content-center bg-warning rounded-circle"
                      style={{ width: "40px", height: "40px" }}
                    >
                      <Zap size={20} className="text-dark" />
                    </div>
                    <div>
                      <div className="fw-semibold">React Mastery</div>
                      <div className="text-muted small">In Progress</div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3 p-3 bg-light border rounded opacity-50">
                    <div
                      className="d-flex align-items-center justify-content-center bg-secondary rounded-circle"
                      style={{ width: "40px", height: "40px" }}
                    >
                      <BookOpen size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="fw-semibold">System Design</div>
                      <div className="text-muted small">Locked</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-top border-bottom bg-light py-5">
        <div className="container py-4">
          <div className="row g-4">
            <div className="col-6 col-md-3 text-center">
              <div className="display-4 fw-bold text-dark mb-2">50+</div>
              <div className="text-muted">Career Roadmaps</div>
            </div>
            <div className="col-6 col-md-3 text-center">
              <div className="display-4 fw-bold text-dark mb-2">10K+</div>
              <div className="text-muted">Active Learners</div>
            </div>
            <div className="col-6 col-md-3 text-center">
              <div className="display-4 fw-bold text-dark mb-2">500+</div>
              <div className="text-muted">Challenges</div>
            </div>
            <div className="col-6 col-md-3 text-center">
              <div className="display-4 fw-bold text-dark mb-2">95%</div>
              <div className="text-muted">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-5">
        <div className="text-center mb-5">
          <h2 className="display-4 fw-bold text-dark mb-4">
            Everything you need to advance your career
          </h2>
          <p className="lead text-muted mx-auto" style={{ maxWidth: "42rem" }}>
            Structured learning paths, interactive challenges, and progress
            tracking all in one place.
          </p>
        </div>

        <div className="row g-4">
          <div className="col-md-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body p-4">
                <div
                  className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded mb-4"
                  style={{ width: "48px", height: "48px" }}
                >
                  <Target size={24} className="text-primary" />
                </div>
                <h3 className="h5 fw-semibold mb-3">Interactive Roadmaps</h3>
                <p className="text-muted">
                  Visual career pathways with step-by-step guidance. Track your
                  progress and unlock new skills as you advance.
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body p-4">
                <div
                  className="d-flex align-items-center justify-content-center bg-success bg-opacity-10 rounded mb-4"
                  style={{ width: "48px", height: "48px" }}
                >
                  <TrendingUp size={24} className="text-success" />
                </div>
                <h3 className="h5 fw-semibold mb-3">Progress Tracking</h3>
                <p className="text-muted">
                  Monitor your growth with detailed analytics. See your
                  achievements, completed challenges, and skill development over
                  time.
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body p-4">
                <div
                  className="d-flex align-items-center justify-content-center bg-warning bg-opacity-10 rounded mb-4"
                  style={{ width: "48px", height: "48px" }}
                >
                  <Award size={24} className="text-warning" />
                </div>
                <h3 className="h5 fw-semibold mb-3">Skill Challenges</h3>
                <p className="text-muted">
                  Practice with real-world challenges. Build your portfolio and
                  earn badges as you master new technologies.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-5">
        <div
          className="card bg-gradient text-white text-center p-5"
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #10b981 100%)",
          }}
        >
          <div className="card-body p-4">
            <h2 className="display-5 fw-bold mb-4">Start your journey today</h2>
            <p className="lead mb-4 mx-auto" style={{ maxWidth: "42rem" }}>
              Join thousands of professionals advancing their careers with
              structured guidance and interactive learning.
            </p>
            {CLERK_PUBLISHABLE_KEY ? (
              <>
                <SignedOut>
                  <Link to="/sign-up" className="btn btn-light btn-lg">
                    Get Started Free <ArrowRight className="ms-2" size={16} />
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link to="/dashboard" className="btn btn-light btn-lg">
                    Go to Dashboard <ArrowRight className="ms-2" size={16} />
                  </Link>
                </SignedIn>
              </>
            ) : (
              <Link to="/sign-up" className="btn btn-light btn-lg">
                Get Started Free <ArrowRight className="ms-2" size={16} />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-top bg-light">
        <div className="container py-4">
          <div className="row align-items-center">
            <div className="col-md-6 mb-3 mb-md-0">
              <div className="d-flex align-items-center gap-2">
                <Target size={20} className="text-primary" />
                <span className="fw-semibold">CareerPath</span>
              </div>
            </div>
            <div className="col-md-6 text-md-end">
              <div className="text-muted small">
                © 2025 CareerPath. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ClerkProviderWithRoutes>
      <Routes>
        {CLERK_PUBLISHABLE_KEY && (
          <>
            <Route path="/sign-in/*" element={<AuthenticationPage />} />
            <Route path="/sign-up/*" element={<AuthenticationPage />} />
          </>
        )}
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<DashboardHome />} />
          <Route path="challenges" element={<ChallengeGenerator />} />
          <Route path="roadmaps" element={<RoadmapsPage />} />
          <Route path="roadmaps/:id" element={<RoadmapDetail />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="ai-chat" element={<AIChatPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </ClerkProviderWithRoutes>
  );
}

export default App;
