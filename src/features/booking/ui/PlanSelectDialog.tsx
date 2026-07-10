import { useState } from "react";
import type { BookingPlan, Store } from "@/types/database";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { calcStorageFee } from "@/lib/fee";
import { formatWon, cn } from "@/lib/utils";

const HOUR_OPTIONS = [1, 2, 3, 4, 6];

/**
 * A형 매장 예약 팝업 — [① 캐리어 보관만] vs [② 보관 + 식사] 선택 + 요금 미리보기.
 * 계획서 요구 3. 실제 예약 생성(insert)은 onConfirm 콜백에서 처리.
 */
export function PlanSelectDialog({
  store,
  open,
  onOpenChange,
  onConfirm,
}: {
  store: Store;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (plan: BookingPlan, hours: number, fee: number) => void;
}) {
  const [plan, setPlan] = useState<BookingPlan>("보관만");
  const [hours, setHours] = useState(2);
  const fee = calcStorageFee(hours);
  const signature = store.menu.find((m) => m.isSignature);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{store.name} · 보관 예약</DialogTitle>
          <DialogDescription>이용 방식과 예상 시간을 선택하세요.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* ① 보관만 */}
          <PlanOption
            selected={plan === "보관만"}
            onClick={() => setPlan("보관만")}
            title="① 캐리어 보관만"
            desc="기본요금 1,000 + 시간당 1,000원"
          />
          {/* ② 보관 + 식사 */}
          {store.type === "A" && (
            <PlanOption
              selected={plan === "보관+식사"}
              onClick={() => setPlan("보관+식사")}
              title="② 보관 + 식사"
              desc={
                signature
                  ? `${signature.name} ${formatWon(
                      store.signature_discount ?? 5000,
                    )} 할인 쿠폰 자동 발급 (당월 말일까지, 매장당 월 1회)`
                  : "시그니처 메뉴 할인 쿠폰 자동 발급"
              }
            />
          )}
        </div>

        {/* 예상 이용시간 */}
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium">예상 이용시간</p>
          <div className="flex gap-2">
            {HOUR_OPTIONS.map((h) => (
              <button
                key={h}
                onClick={() => setHours(h)}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-sm",
                  hours === h
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input",
                )}
              >
                {h}시간
              </button>
            ))}
          </div>
        </div>

        {/* 요금 미리보기 */}
        <div className="mt-4 flex items-center justify-between rounded-lg bg-muted p-3">
          <span className="text-sm text-muted-foreground">예상 총액</span>
          <span className="text-lg font-bold">{formatWon(fee)}</span>
        </div>

        <Button
          className="mt-4 w-full"
          size="lg"
          onClick={() => onConfirm(plan, hours, fee)}
        >
          예약 요청 (점주 승인 대기)
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function PlanOption({
  selected,
  onClick,
  title,
  desc,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  desc: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-lg border p-3 text-left transition-colors",
        selected ? "border-primary bg-primary/5" : "border-input",
      )}
    >
      <p className="font-semibold">{title}</p>
      <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
    </button>
  );
}
