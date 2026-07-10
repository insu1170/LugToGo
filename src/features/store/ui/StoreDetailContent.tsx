import { useState } from "react";
import { RatingBadge } from "@/components/blocks/rating-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertModal } from "@/components/ui/alert-modal";
import { PlanSelectDialog } from "@/features/booking/ui/PlanSelectDialog";
import { useRemaining } from "@/features/map/hooks/useStores";
import type { BookingPlan, Store } from "@/types/database";
import { formatWon } from "@/lib/utils";

/**
 * 매장 상세 본문(요구 2) — 갤러리·평점·영업시간·메뉴·잔여칸·리뷰 + 예약 진입(요구 3).
 * `/store/:id` 라우트 페이지와 지도 위 바텀시트(MapBottomSheet) 양쪽에서 재사용.
 */
export function StoreDetailContent({ store }: { store: Store }) {
  const remaining = useRemaining(store);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmed, setConfirmed] = useState<{
    plan: BookingPlan;
    hours: number;
    fee: number;
  } | null>(null);
  const soldOut = !store.is_accepting || remaining <= 0;

  function handleConfirm(plan: BookingPlan, hours: number, fee: number) {
    // TODO: supabase.from('bookings').insert({ ... status: '대기' })
    setDialogOpen(false);
    setConfirmed({ plan, hours, fee });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto pb-24">
        {/* 대표 이미지 갤러리 (스와이프는 추후) */}
        <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto bg-muted">
          {(store.photos.length ? store.photos : [""]).map((src, i) => (
            <div
              key={i}
              className="aspect-[4/3] w-full shrink-0 snap-center bg-muted"
            >
              {src ? (
                <img src={src} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-sm text-muted-foreground">
                  매장 사진 (Supabase Storage 연동 예정)
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-5 p-4">
          {/* 매장명 · 유형 · 평점 */}
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{store.name}</h2>
            {store.type === "A" && <Badge variant="gold">A형 골드</Badge>}
            <RatingBadge rating={store.avg_rating} className="ml-auto" />
          </div>

          {/* 잔여 칸 */}
          <div className="rounded-lg border p-3 text-sm">
            {soldOut ? (
              <span className="font-semibold text-destructive">보관 불가 (만석/접수중지)</span>
            ) : (
              <span className="font-semibold text-lug-purple">
                캐리어 {remaining}/{store.capacity}칸 남음 (실시간)
              </span>
            )}
          </div>

          {/* 영업시간 */}
          <section>
            <h3 className="mb-1 font-semibold">영업시간</h3>
            <p className="text-sm text-muted-foreground">
              {store.open_time} ~ {store.close_time}
            </p>
          </section>

          {/* 메뉴 */}
          <section>
            <h3 className="mb-2 font-semibold">메뉴</h3>
            <ul className="space-y-2">
              {store.menu.map((m) => (
                <li
                  key={m.name}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-1.5">
                    {m.name}
                    {m.isSignature && <Badge variant="gold">시그니처</Badge>}
                  </span>
                  <span className="text-muted-foreground">{formatWon(m.price)}</span>
                </li>
              ))}
              {store.menu.length === 0 && (
                <li className="text-sm text-muted-foreground">등록된 메뉴 없음</li>
              )}
            </ul>
          </section>

          {/* 방명록 (리뷰) — 추후 reviews 연동 */}
          <section>
            <h3 className="mb-2 font-semibold">방명록</h3>
            <p className="text-sm text-muted-foreground">
              아직 리뷰가 없습니다. 체크아웃 후 첫 리뷰를 남겨보세요.
            </p>
          </section>
        </div>
      </div>

      {/* 하단 고정 예약 버튼 */}
      <div className="sticky bottom-0 border-t bg-background p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <Button
          size="lg"
          className="w-full"
          disabled={soldOut}
          onClick={() => setDialogOpen(true)}
        >
          {soldOut ? "보관 불가" : "보관 예약"}
        </Button>
      </div>

      <PlanSelectDialog
        store={store}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleConfirm}
      />

      <AlertModal
        open={confirmed !== null}
        onOpenChange={(v) => !v && setConfirmed(null)}
        title="예약 요청 완료"
        confirmLabel="확인"
      >
        {confirmed && (
          <div className="space-y-2 rounded-lg bg-muted p-3 text-sm">
            <Row label="이용 방식" value={confirmed.plan} />
            <Row label="예상 이용시간" value={`${confirmed.hours}시간`} />
            <Row label="예상 총액" value={formatWon(confirmed.fee)} strong />
          </div>
        )}
        <p className="mt-3 text-center text-sm text-muted-foreground">
          점주 승인을 기다려주세요. 10분 내 미승인 시 자동 취소됩니다.
        </p>
      </AlertModal>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={strong ? "font-bold" : "font-medium"}>{value}</span>
    </div>
  );
}
