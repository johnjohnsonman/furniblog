import Link from "next/link"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { FeedRecommendation } from "@/lib/reviews/feed-recommendations"

interface SmartRecommendationBannerProps {
  recommendation: FeedRecommendation
}

export function SmartRecommendationBanner({
  recommendation,
}: SmartRecommendationBannerProps) {
  const { profileSummary, mostReviewed, highestRated } = recommendation

  return (
    <div className="mb-6 p-5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-3">
      <p className="text-sm text-foreground leading-relaxed">
        <span className="font-medium">Based on your profile</span> ({profileSummary})
        {mostReviewed && (
          <>
            <br />
            <span className="text-muted-foreground">→ Most reviewed: </span>
            <span className="font-medium">{mostReviewed.productName}</span>
            <span className="text-muted-foreground">
              {" "}
              ({mostReviewed.count} matching reviews)
            </span>
          </>
        )}
        {highestRated && (
          <>
            <br />
            <span className="text-muted-foreground">→ Highest rated: </span>
            <span className="font-medium">{highestRated.productName}</span>
            <span className="text-muted-foreground">
              {" "}
              ({highestRated.avgRating} avg from similar users)
            </span>
          </>
        )}
      </p>
      <Button variant="outline" size="sm" className="bg-background" asChild>
        <Link href="/compare">
          <Sparkles className="h-4 w-4 mr-2" />
          Get AI chair recommendation for my profile →
        </Link>
      </Button>
    </div>
  )
}
