import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** 화이트보드 스케치의 "곤국 4.3, 히로 5" 형태 평점 뱃지 */
export function RatingBadge({
  rating,
  className,
}: {
  rating: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full bg-black/70 px-1.5 py-0.5 text-xs font-semibold text-white",
        className,
      )}
    >
      <Star className="h-3 w-3 fill-lug-gold text-lug-gold" />
      {rating.toFixed(1)}
    </span>
  );
}
