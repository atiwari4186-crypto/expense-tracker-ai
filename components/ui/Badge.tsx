import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Category, CATEGORY_COLORS, CATEGORY_ICONS } from "@/types/expense";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  category: Category;
  showIcon?: boolean;
}

export function CategoryBadge({ category, showIcon = true, className, ...props }: BadgeProps) {
  const color = CATEGORY_COLORS[category];
  const icon = CATEGORY_ICONS[category];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium",
        className
      )}
      style={{
        backgroundColor: `${color}18`,
        color: color,
        border: `1px solid ${color}30`,
      }}
      {...props}
    >
      {showIcon && <span className="text-xs">{icon}</span>}
      {category}
    </span>
  );
}
