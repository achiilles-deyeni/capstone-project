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
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account and view your achievements
        </p>
      </div>

      {/* Profile Card */}
      <Card className="p-6 bg-card border-border">
        <div className="flex flex-col md:flex-row gap-6">
          <Avatar className="h-24 w-24">
            <AvatarFallback className="bg-accent text-accent-foreground text-3xl">
              JD
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  John Doe
                </h2>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>john@example.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>San Francisco, CA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Joined January 2025</span>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                className="border-border text-foreground bg-transparent"
              >
                Edit Profile
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="secondary"
                className="bg-accent/10 text-accent border-accent/20"
              >
                Frontend Developer
              </Badge>
              <Badge
                variant="secondary"
                className="bg-muted text-muted-foreground"
              >
                React Enthusiast
              </Badge>
              <Badge
                variant="secondary"
                className="bg-muted text-muted-foreground"
              >
                Open Source Contributor
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
              <Target className="h-6 w-6 text-success" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">3</div>
              <div className="text-sm text-muted-foreground">
                Active Roadmaps
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">3,450</div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
              <Award className="h-6 w-6 text-success" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">12</div>
              <div className="text-sm text-muted-foreground">Badges Earned</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Skills */}
      <Card className="p-6 bg-card border-border">
        <h2 className="text-xl font-semibold text-foreground mb-4">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {[
            "React",
            "TypeScript",
            "JavaScript",
            "HTML",
            "CSS",
            "Node.js",
            "Git",
            "REST APIs",
            "Redux",
            "Next.js",
            "Tailwind CSS",
            "Testing",
          ].map((skill) => (
            <span
              key={skill}
              className="px-3 py-1 rounded-full bg-muted text-foreground text-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </Card>

      {/* Settings */}
      <Card className="p-6 bg-card border-border">
        <h2 className="text-xl font-semibold text-foreground mb-4">Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <div className="font-medium text-foreground">
                Email Notifications
              </div>
              <div className="text-sm text-muted-foreground">
                Receive updates about your progress
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-border text-foreground bg-transparent"
            >
              Configure
            </Button>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <div className="font-medium text-foreground">
                Privacy Settings
              </div>
              <div className="text-sm text-muted-foreground">
                Control who can see your profile
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-border text-foreground bg-transparent"
            >
              Manage
            </Button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="font-medium text-foreground">
                Account Security
              </div>
              <div className="text-sm text-muted-foreground">
                Password and authentication
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-border text-foreground bg-transparent"
            >
              Update
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
