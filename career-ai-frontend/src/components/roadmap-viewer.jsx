"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Lock, ArrowRight, BookOpen } from "lucide-react";

const roadmapData = [
  {
    id: "1",
    title: "HTML & CSS Fundamentals",
    description: "Learn the building blocks of web development",
    status: "completed",
    resources: 12,
    estimatedTime: "2 weeks",
  },
  {
    id: "2",
    title: "JavaScript Basics",
    description: "Master the fundamentals of JavaScript programming",
    status: "completed",
    resources: 18,
    estimatedTime: "3 weeks",
  },
  {
    id: "3",
    title: "React Fundamentals",
    description: "Build interactive UIs with React",
    status: "in-progress",
    resources: 24,
    estimatedTime: "4 weeks",
  },
  {
    id: "4",
    title: "State Management",
    description: "Learn Redux, Context API, and modern state solutions",
    status: "in-progress",
    resources: 15,
    estimatedTime: "2 weeks",
  },
  {
    id: "5",
    title: "TypeScript",
    description: "Add type safety to your JavaScript applications",
    status: "locked",
    resources: 20,
    estimatedTime: "3 weeks",
  },
  {
    id: "6",
    title: "Advanced React Patterns",
    description:
      "Master hooks, performance optimization, and advanced patterns",
    status: "locked",
    resources: 22,
    estimatedTime: "4 weeks",
  },
  {
    id: "7",
    title: "Testing & Quality",
    description: "Write tests with Jest, React Testing Library, and Cypress",
    status: "locked",
    resources: 16,
    estimatedTime: "2 weeks",
  },
  {
    id: "8",
    title: "Build Tools & Deployment",
    description: "Master Webpack, Vite, and deployment strategies",
    status: "locked",
    resources: 14,
    estimatedTime: "2 weeks",
  },
];

export function RoadmapViewer({ roadmapId }) {
  const completedCount = roadmapData.filter(
    (node) => node.status === "completed"
  ).length;
  const totalCount = roadmapData.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-br from-accent/10 to-success/10 border-accent/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Frontend Developer Roadmap
            </h1>
            <p className="text-muted-foreground">
              Master modern web development step by step
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-foreground mb-1">
              {Math.round(progressPercentage)}%
            </div>
            <div className="text-sm text-muted-foreground">
              {completedCount} of {totalCount} completed
            </div>
          </div>
        </div>
        <Progress value={progressPercentage} className="h-2 mt-4" />
      </Card>

      {/* Roadmap Nodes */}
      <div className="space-y-4">
        {roadmapData.map((node, index) => {
          const isCompleted = node.status === "completed";
          const isInProgress = node.status === "in-progress";
          const isLocked = node.status === "locked";

          return (
            <div key={node.id} className="relative">
              {/* Connector Line */}
              {index < roadmapData.length - 1 && (
                <div className="absolute left-6 top-16 w-0.5 h-12 bg-border" />
              )}

              <Card
                className={`p-6 bg-card transition-all ${
                  isLocked
                    ? "border-border opacity-60"
                    : "border-border hover:border-accent cursor-pointer"
                }`}
              >
                <div className="flex gap-4">
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {isCompleted && (
                      <div className="h-12 w-12 rounded-full bg-success flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-success-foreground" />
                      </div>
                    )}
                    {isInProgress && (
                      <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center">
                        <Circle className="h-6 w-6 text-accent-foreground" />
                      </div>
                    )}
                    {isLocked && (
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <Lock className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          {node.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {node.description}
                        </p>
                      </div>
                      {isInProgress && (
                        <Badge className="bg-accent/10 text-accent border-accent/20">
                          In Progress
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{node.resources} resources</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>⏱️</span>
                        <span>{node.estimatedTime}</span>
                      </div>
                    </div>

                    {!isLocked && (
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          className="bg-accent text-accent-foreground hover:bg-accent/90"
                        >
                          {isCompleted ? "Review" : "Continue"}{" "}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-border text-foreground bg-transparent"
                        >
                          View Resources
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
