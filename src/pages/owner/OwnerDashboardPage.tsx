import { useState } from "react";
import { Header } from "@/components/blocks/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * 점주 화면 (D8, D12) — 골격.
 * TODO:
 *  - 예약 목록 실시간 구독(Realtime) + 승인/거절
 *  - 체크아웃(QR/네임택 번호) → 요금 확정
 *  - 정산 요약(당월 시간요금 × 95%) / 카운팅(오늘·현재보관·잔여칸)
 */
export function OwnerDashboardPage() {
  const [accepting, setAccepting] = useState(true);

  return (
    <div className="flex h-full flex-col">
      <Header
        title="점주 · 곤국"
        showBack
        right={
          <button
            onClick={() => setAccepting((v) => !v)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-semibold",
              accepting
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            보관 {accepting ? "ON" : "OFF"}
          </button>
        }
      />

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {/* 카운팅 요약 */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: "오늘 보관", value: "0" },
            { label: "현재 보관중", value: "0" },
            { label: "잔여 칸", value: "5" },
          ].map((c) => (
            <Card key={c.label}>
              <CardContent className="p-3">
                <p className="text-2xl font-bold">{c.value}</p>
                <p className="text-xs text-muted-foreground">{c.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 정산 요약 */}
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <span className="text-sm text-muted-foreground">당월 정산 (95%)</span>
            <span className="text-lg font-bold">0원</span>
          </CardContent>
        </Card>

        {/* 예약 승인/거절 (더미) */}
        <section>
          <h3 className="mb-2 font-semibold">대기 중인 예약</h3>
          <Card>
            <CardContent className="space-y-3 p-4">
              <p className="text-sm">홍길동 · 보관+식사 · 예상 2시간</p>
              <div className="flex gap-2">
                <Button className="flex-1">승인</Button>
                <Button variant="destructive" className="flex-1">
                  거절
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 체크아웃 */}
        <section>
          <h3 className="mb-2 font-semibold">체크아웃</h3>
          <Card>
            <CardContent className="flex gap-2 p-4">
              <Button variant="secondary" className="flex-1">
                QR 스캔
              </Button>
              <Button variant="outline" className="flex-1">
                네임택 번호 입력
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
