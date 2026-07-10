import { Header } from "@/components/blocks/header";
import { BottomNav } from "@/components/blocks/bottom-nav";

/**
 * 내 예약 목록 — 대기/승인/보관중/완료 상태별.
 * TODO(D10): bookings 조회 + 보관중이면 경과시간·실시간요금·마감 카운트다운 카드.
 */
export function BookingsPage() {
  return (
    <div className="flex h-full flex-col">
      <Header title="내 예약" />
      <div className="flex-1 overflow-y-auto p-4">
        <p className="py-8 text-center text-sm text-muted-foreground">
          예약 내역이 여기에 표시됩니다. (지도에서 매장을 예약해 보세요)
        </p>
      </div>
      <BottomNav />
    </div>
  );
}
