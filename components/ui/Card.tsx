import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function Card({ className, padding = "md", children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-200 shadow-sm",
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
