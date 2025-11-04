"use client";

import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  Home,
  Map,
  TrendingUp,
  History,
  User,
  Menu,
  X,
  Target,
  Bell,
  Search,
} from "lucide-react";
import { Suspense } from "react";
import { SignedIn, SignedOut, useUser, UserButton } from "@clerk/clerk-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Roadmaps", href: "/dashboard/roadmaps", icon: Map },
  { name: "Challenges", href: "/dashboard/challenges", icon: TrendingUp },
  { name: "Progress", href: "/dashboard/progress", icon: History },
  { name: "Chat with AI", href: "/dashboard/ai-chat", icon: Target },
  { name: "Profile", href: "/dashboard/profile", icon: User },
];

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3); // demo unread count
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <Suspense fallback={null}>
      <div className="min-vh-100 bg-light">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
            style={{ zIndex: 1040 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`position-fixed top-0 start-0 h-100 bg-white border-end ${
            sidebarOpen ? "translate-x-0" : "translate-x-n100"
          } d-lg-block`}
          style={{ width: "250px", zIndex: 1050, transition: "transform 0.3s" }}
        >
          <div className="d-flex flex-column h-100">
            {/* Logo */}
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
              <Link
                to="/"
                className="d-flex align-items-center text-decoration-none"
              >
                <Target className="text-primary me-2" size={24} />
                <span className="h5 mb-0 text-dark fw-bold">CareerPath</span>
              </Link>
              <button
                className="btn btn-link d-lg-none p-0"
                onClick={() => setSidebarOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-grow-1 p-3">
              <ul className="nav nav-pills flex-column">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name} className="nav-item mb-1">
                      <Link
                        to={item.href}
                        className={`nav-link d-flex align-items-center ${
                          isActive ? "active" : "text-dark"
                        }`}
                      >
                        <item.icon className="me-2" size={18} />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* User section */}
            <div className="p-3 border-top">
              <SignedIn>
                <UserProfileSummary />
              </SignedIn>
              <SignedOut>
                <div className="d-flex gap-2">
                  <Link
                    to="/sign-in"
                    className="btn btn-outline-primary btn-sm"
                  >
                    Sign In
                  </Link>
                  <Link to="/sign-up" className="btn btn-primary btn-sm">
                    Get Started
                  </Link>
                </div>
              </SignedOut>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div style={{ marginLeft: "250px" }} className="d-none d-lg-block">
          {/* Top bar */}
          <header className="sticky-top bg-white border-bottom">
            <div className="container-fluid d-flex justify-content-between align-items-center py-3">
              <button
                className="btn btn-link d-lg-none p-0"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={20} />
              </button>

              <div className="flex-grow-1 mx-4" style={{ maxWidth: "500px" }}>
                <div className="position-relative">
                  <Search
                    className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Search roadmaps, challenges..."
                    className="form-control ps-5"
                  />
                </div>
              </div>

              <div className="position-relative">
                <button
                  className="btn btn-link position-relative"
                  onClick={() => setNotificationsOpen((s) => !s)}
                  aria-expanded={notificationsOpen}
                  aria-label="Notifications"
                >
                  <Bell size={20} />

                  {unreadCount > 0 && (
                    <span
                      className="badge bg-danger text-white position-absolute"
                      style={{
                        top: -6,
                        right: -6,
                        fontSize: 11,
                        lineHeight: "12px",
                        minWidth: 18,
                        height: 18,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 9,
                        padding: "0 5px",
                      }}
                      aria-label={`${unreadCount} unread notifications`}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div
                    className="position-absolute bg-white border rounded shadow p-3"
                    style={{ right: 0, top: 40, width: 280, zIndex: 1065 }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong>Notifications</strong>
                      <button
                        className="btn btn-sm btn-link text-muted p-0"
                        onClick={() => setNotificationsOpen(false)}
                      >
                        Close
                      </button>
                    </div>
                    <div className="small text-muted">No new notifications</div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="container-fluid p-4">
            <Outlet />
          </main>
        </div>

        {/* Mobile main content */}
        <div className="d-lg-none">
          <header className="sticky-top bg-white border-bottom">
            <div className="container-fluid d-flex justify-content-between align-items-center py-3">
              <button
                className="btn btn-link p-0"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={20} />
              </button>
              <span className="fw-bold">CareerPath</span>
              <button
                className="btn btn-link position-relative"
                onClick={() => setNotificationsOpen((s) => !s)}
                aria-expanded={notificationsOpen}
                aria-label="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span
                    className="badge bg-danger text-white position-absolute"
                    style={{
                      top: -6,
                      right: -6,
                      fontSize: 11,
                      lineHeight: "12px",
                      minWidth: 18,
                      height: 18,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 9,
                      padding: "0 5px",
                    }}
                    aria-label={`${unreadCount} unread notifications`}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
              {notificationsOpen && (
                <div
                  className="position-absolute bg-white border rounded shadow p-3"
                  style={{ right: 16, top: 64, width: 260, zIndex: 1065 }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong>Notifications</strong>
                    <button
                      className="btn btn-sm btn-link text-muted p-0"
                      onClick={() => setNotificationsOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                  <div className="small text-muted">No new notifications</div>
                </div>
              )}
            </div>
          </header>
          <main className="container-fluid p-3">
            <Outlet />
          </main>
        </div>
      </div>
    </Suspense>
  );
}

function UserProfileSummary() {
  const { user } = useUser();

  if (!user) return null;

  const fullName =
    user.fullName ||
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    user.username ||
    "User";
  const email =
    user.primaryEmailAddress?.emailAddress ||
    user.emailAddresses?.[0]?.emailAddress ||
    "";

  return (
    <div className="d-flex align-items-center p-2 rounded bg-light">
      <div
        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
        style={{ width: "32px", height: "32px" }}
      >
        <UserButton afterSignOutUrl="/" />
      </div>
      <div className="flex-grow-1">
        <div className="small fw-medium">{fullName}</div>
        <div className="text-muted" style={{ fontSize: "0.75rem" }}>
          {email}
        </div>
      </div>
    </div>
  );
}
