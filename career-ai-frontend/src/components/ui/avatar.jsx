"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function Avatar({
  src,
  alt = "Avatar",
  size = 40,
  className,
  children,
  ...props
}) {
  const style = { width: size, height: size, objectFit: "cover" };

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn("rounded-circle", className)}
        style={style}
        {...props}
      />
    );
  }

  // If no src is provided, render a circular fallback container that can
  // contain an `AvatarFallback` child (or any children passed).
  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        "rounded-circle d-inline-flex align-items-center justify-content-center bg-secondary text-white",
        className
      )}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}

function AvatarFallback({ children, className, ...props }) {
  return (
    <span className={cn("fw-semibold", className)} {...props}>
      {children}
    </span>
  );
}

export { Avatar, AvatarFallback };
