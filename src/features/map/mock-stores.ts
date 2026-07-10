import type { Store } from "@/types/database";

// 골격 단계용 임시 매장 데이터 (광안리).
// Supabase 키를 넣으면 useStores 가 실제 DB 를 우선 사용합니다.
// 좌표는 대략치 — D1 체크리스트에서 네이버 지도로 실좌표를 찍어 교체하세요.
export const MOCK_STORES: Store[] = [
  {
    id: "mock-gonguk",
    name: "곤국",
    lat: 35.1532,
    lng: 129.1187,
    type: "A",
    open_time: "10:00",
    close_time: "22:00",
    capacity: 5,
    is_accepting: true,
    photos: [],
    menu: [
      { name: "시그니처 곤이국밥", price: 12000, isSignature: true },
      { name: "공기밥", price: 1000, isSignature: false },
    ],
    signature_discount: 5000,
    avg_rating: 4.3,
  },
  {
    id: "mock-hiro",
    name: "히로",
    lat: 35.1541,
    lng: 129.1163,
    type: "A",
    open_time: "11:00",
    close_time: "21:00",
    capacity: 4,
    is_accepting: true,
    photos: [],
    menu: [{ name: "히로 정식", price: 15000, isSignature: true }],
    signature_discount: 5000,
    avg_rating: 5.0,
  },
  {
    id: "mock-cafe",
    name: "광안리 보관카페",
    lat: 35.1528,
    lng: 129.1201,
    type: "기본",
    open_time: "09:00",
    close_time: "23:00",
    capacity: 6,
    is_accepting: false, // 보관 Off 예시 (회색 잠금 테스트용)
    photos: [],
    menu: [],
    signature_discount: null,
    avg_rating: 4.0,
  },
];
