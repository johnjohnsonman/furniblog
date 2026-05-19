import {
  Star,
  MessageCircle,
  Youtube,
  MessagesSquare,
  FileText,
  Globe,
  Search,
  ShieldCheck,
  HelpCircle,
  Newspaper,
  Twitter,
} from "lucide-react"
import type { ReviewSource } from "@/types/review"
import { cn } from "@/lib/utils"

const BADGE_CONFIG: Record<
  ReviewSource,
  {
    label: string
    className: string
    icon: typeof Star
  }
> = {
  chairpark: {
    label: "Chairpark in-store",
    className: "bg-blue-50 text-blue-800 border-blue-200",
    icon: Star,
  },
  reddit: {
    label: "Reddit r/officechairs",
    className: "bg-orange-50 text-orange-800 border-orange-200",
    icon: MessageCircle,
  },
  youtube: {
    label: "YouTube review",
    className: "bg-red-50 text-red-800 border-red-200",
    icon: Youtube,
  },
  dcinside: {
    label: "DC Inside office chairs",
    className: "bg-sky-50 text-sky-800 border-sky-200",
    icon: MessagesSquare,
  },
  naver: {
    label: "Naver blog",
    className: "bg-green-50 text-green-800 border-green-200",
    icon: FileText,
  },
  japan_community: {
    label: "Japan community",
    className: "bg-purple-50 text-purple-800 border-purple-200",
    icon: Globe,
  },
  google: {
    label: "Google reviews",
    className: "bg-slate-50 text-slate-700 border-slate-200",
    icon: Search,
  },
  trustpilot: {
    label: "Trustpilot review",
    className: "bg-[#00B67A]/10 text-[#00B67A] border-[#00B67A]/30",
    icon: ShieldCheck,
  },
  review_sites: {
    label: "Review Sites",
    className: "bg-blue-100 text-blue-800 border-blue-200",
    icon: FileText,
  },
  hackernews: {
    label: "Hacker News",
    className: "bg-[#FF6600]/10 text-[#FF6600] border-[#FF6600]/30",
    icon: Newspaper,
  },
  twitter: {
    label: "Twitter / X",
    className: "bg-sky-50 text-sky-700 border-sky-200",
    icon: Twitter,
  },
  quora: {
    label: "Quora answer",
    className: "bg-[#B92B27]/10 text-[#B92B27] border-[#B92B27]/30",
    icon: HelpCircle,
  },
}

interface SourceBadgeProps {
  source: ReviewSource
  className?: string
  variant?: "default" | "compact"
}

export function SourceBadge({
  source,
  className,
  variant = "default",
}: SourceBadgeProps) {
  const config = BADGE_CONFIG[source]
  const Icon = config.icon

  if (variant === "compact") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border max-w-[140px]",
          config.className,
          className
        )}
        title={config.label}
      >
        <Icon className="h-3 w-3 shrink-0" />
        <span className="truncate">{config.label}</span>
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {config.label}
    </span>
  )
}
