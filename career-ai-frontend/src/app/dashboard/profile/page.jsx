import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import API from "@/services/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  MapPin,
  Calendar,
  Award,
  TrendingUp,
  Target,
} from "lucide-react";

export default function ProfilePage() {
  const { user } = useUser();

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    location: "",
    joined: "",
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fullName =
    user?.fullName ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    user?.username ||
    "User";

  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    "";

  const initials = (fullName || "")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  useEffect(() => {
    if (!user) return;
    let canceled = false;
    setLoading(true);
    API.get(`/api/users/${user.id}`)
      .then((res) => {
        if (canceled) return;
        const p = res.data || {};
        setProfile(p.profile || p);
        setForm((f) => ({
          ...f,
          firstName: (p.profile && p.profile.firstName) || user.firstName || "",
          lastName: (p.profile && p.profile.lastName) || user.lastName || "",
          location: (p.profile && p.profile.location) || "",
          joined: (p.profile && p.profile.joined) || "",
        }));
      })
      .catch((e) => {
        if (canceled) return;
        console.error("Failed to load profile", e);
        setError("Failed to load profile");
      })
      .finally(() => {
        if (!canceled) setLoading(false);
      });
    return () => {
      canceled = true;
    };
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      const res = await API.put(`/api/users/${user.id}`, { profile: form });
      setProfile(res.data.profile || res.data);
      setEditing(false);
    } catch (e) {
      console.error("Failed to save profile", e);
      setError("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="h3">Profile</h1>
        <p className="text-muted">
          Manage your account and view your achievements
        </p>
      </div>

      <Card className="p-3">
        <div className="d-flex flex-column flex-md-row gap-3">
          <div className="d-flex align-items-start">
            <Avatar className="me-3" style={{ width: 96, height: 96 }}>
              <AvatarFallback
                className="d-flex align-items-center justify-content-center bg-primary text-white fw-bold"
                style={{ width: 96, height: 96, fontSize: 28 }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-grow-1">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-2">
              <div>
                <div className="fw-bold" style={{ fontSize: 20 }}>
                  {fullName}
                </div>
                <div className="text-muted">{email}</div>
              </div>

              <div>
                {!editing ? (
                  <Button
                    variant="outline"
                    className="btn btn-outline-secondary"
                    onClick={() => setEditing(true)}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline"
                      className="btn btn-outline-primary"
                      onClick={save}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      variant="outline"
                      className="btn btn-outline-secondary"
                      onClick={() => setEditing(false)}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-2 text-muted">
              <div className="d-flex align-items-center gap-2">
                <Mail size={14} />{" "}
                <small>
                  {profile?.location || form.location || "San Francisco, CA"}
                </small>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Calendar size={14} />{" "}
                <small>
                  {profile?.joined || form.joined || "Joined January 2025"}
                </small>
              </div>
            </div>

            {editing && (
              <div className="mt-3">
                <div className="row g-2 mb-2">
                  <div className="col-md-4">
                    <input
                      className="form-control"
                      value={form.firstName}
                      onChange={(e) =>
                        setForm({ ...form, firstName: e.target.value })
                      }
                      placeholder="First name"
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      className="form-control"
                      value={form.lastName}
                      onChange={(e) =>
                        setForm({ ...form, lastName: e.target.value })
                      }
                      placeholder="Last name"
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      className="form-control"
                      value={form.location}
                      onChange={(e) =>
                        setForm({ ...form, location: e.target.value })
                      }
                      placeholder="Location"
                    />
                  </div>
                </div>
                <div className="mb-2">
                  <input
                    className="form-control"
                    value={form.joined}
                    onChange={(e) =>
                      setForm({ ...form, joined: e.target.value })
                    }
                    placeholder="Joined date (friendly)"
                  />
                </div>
                {error && <div className="text-danger small">{error}</div>}
              </div>
            )}

            <div className="d-flex flex-wrap gap-2 mt-3">
              <Badge className="bg-light text-dark">Frontend Developer</Badge>
              <Badge className="bg-light text-dark">React Enthusiast</Badge>
              <Badge className="bg-light text-dark">Open Source</Badge>
            </div>
          </div>
        </div>
      </Card>

      <div className="row g-3">
        <div className="col-md-4">
          <Card className="p-3">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-success text-white rounded p-2">
                <Target size={20} />
              </div>
              <div>
                <div className="fw-bold">3</div>
                <div className="text-muted small">Active Roadmaps</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="col-md-4">
          <Card className="p-3">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-accent text-white rounded p-2">
                <TrendingUp size={20} />
              </div>
              <div>
                <div className="fw-bold">3,450</div>
                <div className="text-muted small">Total Points</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="col-md-4">
          <Card className="p-3">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-success text-white rounded p-2">
                <Award size={20} />
              </div>
              <div>
                <div className="fw-bold">12</div>
                <div className="text-muted small">Badges Earned</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
