import { useCallback, useMemo, useRef, useState } from "react";
import { Search, LocateFixed, SlidersHorizontal } from "lucide-react";
import { FilterChips, type StoreFilter } from "@/components/blocks/filter-chips";
import { BottomNav } from "@/components/blocks/bottom-nav";
import { AlertModal } from "@/components/ui/alert-modal";
import { NaverMap, type NaverMapHandle } from "@/features/map/ui/NaverMap";
import { MapBottomSheet } from "@/features/map/ui/MapBottomSheet";
import { useStores } from "@/features/map/hooks/useStores";
import type { Store } from "@/types/database";
import { cn } from "@/lib/utils";

const SHEET_TRANSITION = "transition-[bottom] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]";

/**
 * 요구 1 — 지도 화면 (네이버지도 모바일 스타일)
 *  · 지도가 화면을 꽉 채움
 *  · 상단: 떠 있는 검색창 + 필터 칩(전체/A형)
 *  · 우측: 현위치(GPS) 버튼 — 바텀시트 높이를 따라 같이 움직임
 *  · 하단: 매장 목록 ↔ 상세 미리보기가 하나의 바텀시트로 애니메이션 전환
 */
export function MapPage() {
  const { stores, loading } = useStores();
  const [filter, setFilter] = useState<StoreFilter>("전체");
  const [query, setQuery] = useState("");
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const mapRef = useRef<NaverMapHandle>(null);
  const [sheetHeightPct, setSheetHeightPct] = useState(40);
  const [sheetDragging, setSheetDragging] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  const visible = useMemo(
    () =>
      stores.filter((s) => {
        const byType = filter === "전체" || s.type === filter;
        const byQuery = !query || s.name.includes(query);
        return byType && byQuery;
      }),
    [stores, filter, query],
  );

  const handleSheetHeightChange = useCallback((pct: number, dragging: boolean) => {
    setSheetHeightPct(pct);
    setSheetDragging(dragging);
  }, []);

  // 매장을 선택하면(카드 탭 또는 마커 탭) 시트를 열면서 지도 카메라도 그 매장 위치로 이동
  const handleSelectStore = useCallback((store: Store) => {
    setSelectedStore(store);
    mapRef.current?.panTo(store.lat, store.lng);
  }, []);

  function handleLocate() {
    if (!navigator.geolocation) {
      setLocateError("이 브라우저에서는 위치 확인을 지원하지 않습니다.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapRef.current?.showCurrentLocation(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setLocateError(
          "위치 권한이 거부되었거나 확인할 수 없습니다. 브라우저 설정에서 위치 권한을 허용해주세요.",
        );
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  return (
    <div className="relative flex h-full flex-col">
      {/* 지도 + 플로팅 오버레이 영역 */}
      <div className="relative flex-1 overflow-hidden">
        {/* 전체화면 지도 */}
        <div className="absolute inset-0">
          <NaverMap ref={mapRef} stores={visible} onSelect={handleSelectStore} />
        </div>

        {/* 상단 플로팅: 검색창 + 필터 */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 space-y-2 p-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
          {/* 검색창 */}
          <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-md">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="매장명 · 지역 검색"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <SlidersHorizontal className="h-5 w-5 shrink-0 text-muted-foreground" />
          </div>
          {/* 필터 칩 */}
          <div className="pointer-events-auto">
            <FilterChips value={filter} onChange={setFilter} />
          </div>
        </div>

        {/* 현위치(GPS) 버튼 — 바텀시트 상단에 맞춰 같이 움직임 */}
        <button
          style={{ bottom: `calc(${sheetHeightPct}% + 12px)` }}
          className={cn(
            "absolute right-3 z-20 grid h-11 w-11 place-items-center rounded-full bg-white shadow-md",
            !sheetDragging && SHEET_TRANSITION,
          )}
          onClick={handleLocate}
          aria-label="현재 위치"
          title="현재 위치로 이동"
        >
          <LocateFixed className="h-5 w-5" />
        </button>

        <MapBottomSheet
          stores={visible}
          loading={loading}
          selectedStore={selectedStore}
          onSelectStore={handleSelectStore}
          onCloseStore={() => setSelectedStore(null)}
          onHeightChange={handleSheetHeightChange}
        />
      </div>

      <BottomNav />

      <AlertModal
        open={locateError !== null}
        onOpenChange={(v) => !v && setLocateError(null)}
        title="현재 위치를 가져올 수 없어요"
        variant="error"
      >
        <p className="text-center text-sm text-muted-foreground">{locateError}</p>
      </AlertModal>
    </div>
  );
}
