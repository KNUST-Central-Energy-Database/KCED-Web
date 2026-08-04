import { Link } from "@tanstack/react-router";
import { ChevronRight, type LucideIcon } from "lucide-react";

interface QuickActionCardProps {
  title: string;
  /** Subtext shown below the title. */
  subtext?: string;
  /** Lucide icon component to display in a circle. */
  icon: LucideIcon;
  /** Internal route to open when the card is clicked. */
  to?: string;
  /** Hex colour for the card border & translucent background (e.g. `"#6EE7B7"`). */
  color?: string;
  /** Hex colour for the title text (deeper than `color`). */
  titleColor?: string;
  /** Optional click handler — when provided, used instead of navigation. */
  onClick?: () => void;
}

export function QuickActionCard({ title, subtext, icon: Icon, to, color = "#F9F9F9", titleColor, onClick }: QuickActionCardProps) {
  const textColor = titleColor ?? color;

  const content = (
    <div className="group flex flex-col gap-4 rounded-4xl p-6 border cursor-pointer"
      style={{ borderColor: color, backgroundColor: `${color}33` }}
    >
      <div className="flex items-start justify-between">
        <div
          className="flex h-[45px] w-[45px] items-center justify-center rounded-full bg-white/70"
          style={{ color: textColor }}
        >
          <Icon className="size-5" />
        </div>
        <div className="relative size-5">
          <ChevronRight className="size-5 shrink-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100" style={{ color: `${textColor}B3` }} />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <p className="truncate text-lg font-semibold" style={{ color: textColor }}>{title}</p>
        {subtext && (
          <p className="truncate text-sm font-medium" style={{ color: `${textColor}B3` }}>{subtext}</p>
        )}
      </div>
    </div>
  );

  if (onClick) {
    return <button onClick={onClick} className="text-left">{content}</button>;
  }

  return (
    <Link to={to ?? "#"} className="contents">
      {content}
    </Link>
  );
}
