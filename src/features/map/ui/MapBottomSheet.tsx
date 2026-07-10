import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Store } from "@/types/database";
import { StoreCard } from "@/components/blocks/store-card";
import { RatingBadge } from "@/components/blocks/rating-badge";
import { StoreDetailContent } from "@/features/store/ui/StoreDetailContent";
import { cn } from "@/lib/utils";

const LIST_PCT = 40; // 매장 목록 기본 높이
const PREVIEW_PCT = 58; // 매장 선택 시 미리보기 높이
const FULL_PCT = 100; // 끝까지 확장 시 화면(지도 영역)을 꽉 채움
const CLOSE_PCT = 22; // 상세 상태에서 이 아래로 내려가면 닫힘 → 목록으로 복귀
const TAP_THRESHOLD = 6; // 이 픽셀 이하로 움직이면 드래그가 아니라 탭으로 간주

const TRANSITION = "transition-[height] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]";

/**
 * 지도 화면 하단의 단일 바텀시트.
 * 목록 ↔ 매장 상세 사이를 같은 패널의 높이 애니메이션으로 전환한다.
 *  · 목록 상태: 핸들을 드래그(또는 탭)해서 접힘(핸들+타이틀만 보이는 최소 높이) ↔ 펼침(LIST_PCT) 전환
 *  · 상세 상태: 핸들 드래그로 미리보기 ↔ 전체화면 ↔ 닫힘(목록 복귀)
 *  · 목록이 접혀 있어도 매장을 선택(카드 탭 또는 지도 마커 탭)하면 항상 미리보기 높이로 다시 올라옴
 */
export function MapBottomSheet({
  stores,
  loading,
  selectedStore,
  onSelectStore,
  onCloseStore,
  onHeightChange,
}: {
  stores: Store[];
  loading: boolean;
  selectedStore: Store | null;
  onSelectStore: (store: Store) => void;
  onCloseStore: () => void;
  /** 현재 시트 높이(%)와 드래그 중 여부 — 지도 위에 떠 있는 다른 버튼(GPS 등)을 같이 움직이는 데 사용 */
  onHeightChange?: (heightPct: number, dragging: boolean) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [heightPct, setHeightPct] = useState(LIST_PCT);
  const [dragging, setDragging] = useState(false);
  const [closing, setClosing] = useState(false);
  const dragStart = useRef<{ y: number; heightPct: number } | null>(null);

  const showDetail = selectedStore != null;

  // 접힘 최소 높이 = 핸들+타이틀 줄의 실제 픽셀 높이를 그대로 사용 (화면 크기와 무관하게 딱 그만큼만 남김)
  function getMinPct() {
    const headerPx = headerRef.current?.offsetHeight ?? 48;
    const parentHeight =
      containerRef.current?.parentElement?.clientHeight ?? window.innerHeight;
    return (headerPx / parentHeight) * 100;
  }

  // 매장을 선택하면(목록이 접혀 있었더라도, 다른 매장으로 바뀌어도) 미리보기 높이로 부드럽게 확장
  useEffect(() => {
    if (selectedStore) setHeightPct(PREVIEW_PCT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStore?.id]);

  // 시트 높이/드래그 상태를 부모에 알림 (GPS 버튼 등 다른 플로팅 요소를 같이 움직이기 위함)
  useEffect(() => {
    onHeightChange?.(heightPct, dragging);
  }, [heightPct, dragging, onHeightChange]);

  function closeToList() {
    setClosing(true);
    setHeightPct(LIST_PCT);
  }

  // 목록 높이까지 다 줄어드는 애니메이션이 끝난 뒤에만 실제로 내용을 목록으로 교체
  // (애니메이션 도중 내용이 먼저 바뀌어 버리면 부자연스럽게 보임)
  function handleTransitionEnd(e: React.TransitionEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget || e.propertyName !== "height") return;
    if (closing) {
      setClosing(false);
      onCloseStore();
    }
  }

  function handlePointerDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture(e.pointerId);
    dragStart.current = { y: e.clientY, heightPct };
    setDragging(true);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragStart.current || !containerRef.current) return;
    const parentHeight =
      containerRef.current.parentElement?.clientHeight ?? window.innerHeight;
    const deltaY = e.clientY - dragStart.current.y;
    // 핸들을 아래로 내리면(deltaY 양수) 높이가 줄고, 위로 올리면 늘어남
    const deltaPct = (deltaY / parentHeight) * 100;
    const min = showDetail ? 0 : getMinPct();
    const max = showDetail ? FULL_PCT : LIST_PCT;
    const next = Math.min(max, Math.max(min, dragStart.current.heightPct - deltaPct));
    setHeightPct(next);
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (!dragStart.current) return;
    const { y: startY, heightPct: startHeight } = dragStart.current;
    const dragDistance = Math.abs(e.clientY - startY);
    dragStart.current = null;
    setDragging(false);

    if (showDetail) {
      if (heightPct < CLOSE_PCT) {
        closeToList();
        return;
      }
      const mid = (PREVIEW_PCT + FULL_PCT) / 2;
      setHeightPct(heightPct >= mid ? FULL_PCT : PREVIEW_PCT);
      return;
    }

    // 목록 모드: 거의 안 움직였으면 탭으로 보고 접힘↔펼침을 반전, 드래그했으면 가까운 쪽으로 스냅
    const minPct = getMinPct();
    if (dragDistance < TAP_THRESHOLD) {
      setHeightPct(startHeight <= (minPct + LIST_PCT) / 2 ? LIST_PCT : minPct);
    } else {
      const mid = (minPct + LIST_PCT) / 2;
      setHeightPct(heightPct >= mid ? LIST_PCT : minPct);
    }
  }

  const collapsed = !showDetail && heightPct <= (getMinPct() + LIST_PCT) / 2;

  return (
    <div
      ref={containerRef}
      style={{ height: `${heightPct}%` }}
      onTransitionEnd={handleTransitionEnd}
      className={cn(
        "absolute inset-x-0 bottom-0 z-20 flex flex-col overflow-hidden rounded-t-2xl bg-background shadow-[0_-4px_20px_rgba(0,0,0,0.08)]",
        !dragging && TRANSITION,
      )}
    >
      {/* 핸들 + 헤더 (목록/상세 공용, 내용만 전환) — 드래그 및 탭으로 접힘/펼침 */}
      <div
        ref={headerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="flex shrink-0 touch-none cursor-grab flex-col items-center pb-1 pt-2 active:cursor-grabbing"
      >
        <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />

        {showDetail && selectedStore ? (
          <div className="mt-2 flex w-full items-center gap-2 px-4">
            <button
              onClick={closeToList}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full hover:bg-accent"
              aria-label="목록으로"
            >
              <ChevronDown className="h-5 w-5" />
            </button>
            <span className="truncate font-semibold">{selectedStore.name}</span>
            <RatingBadge rating={selectedStore.avg_rating} className="ml-auto" />
          </div>
        ) : (
          <div className="flex w-full items-center justify-between px-4 pb-1 pt-2">
            <p className="text-sm font-semibold">
              보관 가능 매장{" "}
              <span className="text-muted-foreground">{stores.length}</span>
            </p>
            {collapsed && <ChevronUp className="h-4 w-4 text-muted-foreground" />}
          </div>
        )}
      </div>

      {/* 내용 (목록/상세 전환 시 살짝 페이드) */}
      {showDetail && selectedStore ? (
        <div key={selectedStore.id} className="flex min-h-0 flex-1 flex-col animate-in fade-in duration-200">
          <StoreDetailContent store={selectedStore} />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-3 pb-3 animate-in fade-in duration-200">
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              매장 불러오는 중…
            </p>
          ) : stores.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              조건에 맞는 매장이 없습니다.
            </p>
          ) : (
            <div className="space-y-2">
              {stores.map((s) => (
                <StoreCard
                  key={s.id}
                  store={s}
                  remaining={s.capacity}
                  onSelect={onSelectStore}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
