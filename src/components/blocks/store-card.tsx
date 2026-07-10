import { Lock } from "lucide-react";
import type { Store } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { RatingBadge } from "./rating-badge";
import { cn } from "@/lib/utils";

/**
 * 지도 하단 시트나 목록에 쓰는 매장 요약 카드.
 * 탭하면 즉시 풀스크린 이동 대신 onSelect 로 미리보기 시트를 띄웁니다.
 */
export function StoreCard({
  store,
  remaining,
  onSelect,
}: {
  store: Store;
  remaining: number;
  onSelect: (store: Store) => void;
}) {
  const off = !store.is_accepting || remaining <= 0;
  return (
    <button
      onClick={() => onSelect(store)}
      className={cn(
        "flex w-full gap-3 rounded-xl border bg-card p-3 text-left",
        off && "opacity-60",
      )}
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
        {store.photos[0] ? (
          <img
            src={store.photos[0]}
            alt={store.name}
            className="h-full w-full object-cover"
          />
        ) : null}
        {off && (
          <div className="absolute inset-0 grid place-items-center bg-black/40">
            <Lock className="h-5 w-5 text-white" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate font-semibold">{store.name}</span>
          {store.type === "A" && <Badge variant="gold">A형</Badge>}
        </div>
        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <RatingBadge rating={store.avg_rating} />
          <span>·</span>
          <span>
            {store.open_time}~{store.close_time}
          </span>
        </div>
        <p className="mt-1 text-sm">
          {off ? (
            <span className="text-destructive">보관 불가</span>
          ) : (
            <span className="text-lug-purple">
              {remaining}/{store.capacity}칸 남음
            </span>
          )}
        </p>
      </div>
    </button>
  );
}
