// src/components/ui/responsive-container.tsx
import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  fullWidthOnMobile?: boolean;
}

/**
 * A container component that adapts to different screen sizes
 * with consistent padding and max-width
 */
export function ResponsiveContainer({
  children,
  className,
  fullWidthOnMobile = false,
}: ResponsiveContainerProps) {
  return (
    <div
      className={cn(
        "w-full mx-auto px-4 sm:px-6 md:px-8",
        fullWidthOnMobile ? "max-w-none sm:max-w-3xl lg:max-w-6xl" : "max-w-3xl lg:max-w-6xl",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * A two-column grid that stacks on mobile
 */
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  leftColClassName?: string;
  rightColClassName?: string;
  leftSideWidth?: "narrow" | "medium" | "wide";
  reversed?: boolean;
}

export function ResponsiveGrid({
  children,
  className,
  leftColClassName,
  rightColClassName,
  leftSideWidth = "medium",
  reversed = false,
}: ResponsiveGridProps) {
  // Determine the width for the left column based on the prop
  const leftWidthClass = {
    narrow: "md:w-1/4",
    medium: "md:w-1/3",
    wide: "md:w-2/5",
  }[leftSideWidth];

  // Determine the width for the right column based on the left column
  const rightWidthClass = {
    narrow: "md:w-3/4",
    medium: "md:w-2/3",
    wide: "md:w-3/5",
  }[leftSideWidth];

  // Extract the two children (left and right columns)
  const childrenArray = React.Children.toArray(children);
  if (childrenArray.length !== 2) {
    console.error('ResponsiveGrid should have exactly two children');
  }

  const [leftContent, rightContent] = childrenArray;

  return (
    <div className={cn("flex flex-col md:flex-row gap-6", className)}>
      <div
        className={cn(
          "w-full order-1", 
          leftWidthClass,
          reversed ? "md:order-2" : "md:order-1",
          leftColClassName
        )}
      >
        {leftContent}
      </div>
      <div
        className={cn(
          "w-full order-2", 
          rightWidthClass,
          reversed ? "md:order-1" : "md:order-2",
          rightColClassName
        )}
      >
        {rightContent}
      </div>
    </div>
  );
}