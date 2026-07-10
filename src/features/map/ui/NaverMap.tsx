import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { Store } from "@/types/database";
import { useNaverLoader } from "../hooks/useNaverLoader";

// 매장 유형/상태별 마커 색상 (계획서 요구 1)
function markerColor(store: Store): string {
  if (!store.is_accepting) return "#9CA3AF"; // 보관 Off → 회색
  if (store.type === "A") return "#E9B949"; // A형 골드
  if (store.avg_rating >= 4.5) return "#7C5CFF"; // 평점 우수 보라
  return "#334155";
}

// 네이버지도 스타일 라벨 마커 HTML. 좌표 위에 말풍선처럼 뜸.
// (Tailwind purge 영향을 피하려 인라인 스타일 사용)
function markerContent(store: Store): string {
  const color = markerColor(store);
  const off = !store.is_accepting;
  return `
    <div style="transform:translate(-50%,-100%);cursor:pointer;${off ? "opacity:.7;" : ""}">
      <div style="display:flex;align-items:center;gap:4px;white-space:nowrap;
                  padding:4px 10px;border-radius:9999px;background:#fff;
                  border:2px solid ${color};box-shadow:0 2px 6px rgba(0,0,0,.2);
                  font-size:12px;font-weight:700;color:#111;">
        <span>${store.name}</span>
        <span style="color:#E9B949;">★</span>
        <span>${store.avg_rating.toFixed(1)}</span>
      </div>
      <div style="width:0;height:0;margin:-1px auto 0;
                  border-left:5px solid transparent;border-right:5px solid transparent;
                  border-top:6px solid ${color};"></div>
    </div>`;
}

// 현재 위치 마커 HTML (구글맵 스타일 파란 점)
const CURRENT_LOCATION_CONTENT = `
  <div style="width:16px;height:16px;border-radius:9999px;background:#4285F4;
              border:3px solid #fff;box-shadow:0 0 0 4px rgba(66,133,244,.3);"></div>`;

// panTo 부드러운 이동 옵션 (지정 안 하면 즉시 이동하는 경우가 있어 명시적으로 지정)
const PAN_OPTIONS = { duration: 500, easing: "easeOutCubic" } as const;

export interface NaverMapHandle {
  /** 지정한 좌표로 지도 중심만 이동 (마커 없음) — 매장 선택 시 카메라 이동용 */
  panTo: (lat: number, lng: number) => void;
  /** 지정한 좌표로 이동하고 현재 위치 마커(파란 점)를 표시/갱신 — GPS 버튼용 */
  showCurrentLocation: (lat: number, lng: number) => void;
}

/**
 * 네이버 지도 렌더러.
 * 키가 없으면(no-key) 안내 플레이스홀더를 대신 보여줍니다.
 */
export const NaverMap = forwardRef<
  NaverMapHandle,
  { stores: Store[]; onSelect: (store: Store) => void }
>(function NaverMap({ stores, onSelect }, ref) {
  const state = useNaverLoader();
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const currentLocationMarkerRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    panTo(lat, lng) {
      if (!mapRef.current || !window.naver) return;
      mapRef.current.panTo(new window.naver.maps.LatLng(lat, lng), PAN_OPTIONS);
    },
    showCurrentLocation(lat, lng) {
      if (!mapRef.current || !window.naver) return;
      const { naver } = window;
      const position = new naver.maps.LatLng(lat, lng);
      mapRef.current.panTo(position, PAN_OPTIONS);
      if (currentLocationMarkerRef.current) {
        currentLocationMarkerRef.current.setPosition(position);
      } else {
        currentLocationMarkerRef.current = new naver.maps.Marker({
          position,
          map: mapRef.current,
          icon: {
            content: CURRENT_LOCATION_CONTENT,
            anchor: new naver.maps.Point(8, 8),
          },
          zIndex: 200,
        });
      }
    },
  }));

  // 지도 1회 생성
  useEffect(() => {
    if (state !== "ready" || !elRef.current || mapRef.current) return;
    const { naver } = window;
    mapRef.current = new naver.maps.Map(elRef.current, {
      center: new naver.maps.LatLng(35.1532, 129.1187), // 광안리
      zoom: 15,
      // 축척 바("300m" 등)와 저작권/지도데이터 표시("©NAVER Corp" 등)는 API 정책상 노출 여부 조정이
      // 허용되어 숨김. NAVER 로고 자체(LogoControl)는 약관상 필수 표시 요소라 건드리지 않음.
      scaleControl: false,
      mapDataControl: false,
    });
  }, [state]);

  // 매장(필터 결과) 바뀔 때 마커 동기화
  useEffect(() => {
    if (state !== "ready" || !mapRef.current) return;
    const { naver } = window;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = stores.map((store) => {
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(store.lat, store.lng),
        map: mapRef.current,
        icon: {
          content: markerContent(store),
          anchor: new naver.maps.Point(0, 0),
        },
      });
      naver.maps.Event.addListener(marker, "click", () => onSelect(store));
      return marker;
    });
  }, [state, stores, onSelect]);

  if (state === "no-key") {
    return (
      <div className="grid h-full place-items-center bg-muted p-6 text-center">
        <div className="max-w-xs text-sm text-muted-foreground">
          <p className="mb-2 font-semibold text-foreground">지도 키가 필요합니다</p>
          <p>
            <code>.env</code> 의 <code>VITE_NAVER_MAP_CLIENT_ID</code> 를 채우면
            네이버 지도가 표시됩니다. 지금은 아래 목록으로 매장을 확인하세요.
          </p>
        </div>
      </div>
    );
  }
  if (state === "error") {
    return (
      <div className="grid h-full place-items-center bg-muted p-6 text-center text-sm text-destructive">
        지도 로드 실패 — 네이버클라우드 콘솔의 Web 서비스 URL 에
        접속 도메인(예: http://localhost:5173)이 등록됐는지 확인하세요.
      </div>
    );
  }

  return <div ref={elRef} className="h-full w-full" />;
});
