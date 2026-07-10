// 짐투고 데이터 모델 (6개 테이블). 계획서 §4 기준.
// Supabase CLI 로 자동 생성도 가능하지만, 골격 단계에서는 수기로 정의합니다.
//   supabase gen types typescript --project-id <id> > src/types/database.ts

export type StoreType = "A" | "B" | "C" | "기본";
export type UserRole = "user" | "owner";
export type BookingPlan = "보관만" | "보관+식사";
export type BookingStatus =
  | "대기"
  | "승인"
  | "체크인"
  | "보관중"
  | "완료"
  | "거절"
  | "만료";

export interface MenuItem {
  name: string;
  price: number;
  isSignature: boolean;
}

export interface Store {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: StoreType;
  open_time: string; // "09:00"
  close_time: string; // "22:00"
  capacity: number;
  is_accepting: boolean; // 보관 접수 On/Off 토글
  photos: string[];
  menu: MenuItem[];
  signature_discount: number | null; // A형: 5000
  avg_rating: number; // reviews 로 자동 갱신
}

export interface AppUser {
  id: string; // Supabase Auth uid
  role: UserRole;
  phone: string | null;
  lodging_addr: string | null; // 숙소 주소
  home_addr: string | null; // 주거지 주소
}

export interface Booking {
  id: string;
  user_id: string;
  store_id: string;
  plan: BookingPlan;
  status: BookingStatus;
  approved_at: string | null;
  checkin_at: string | null;
  checkout_at: string | null;
  fee: number | null;
  nametag_no: string | null; // 4자리
  photo_urls: string[]; // 짐 촬영(면책)
  disclaimer_agreed: boolean;
  created_at: string;
}

export interface Coupon {
  id: string;
  user_id: string;
  store_id: string;
  type: "A";
  value: number; // 5000
  expires_at: string; // 당월 말일
  used_at: string | null;
  issued_month: string; // "2026-07" — UNIQUE(user_id, store_id, issued_month)
}

export interface Review {
  id: string;
  booking_id: string;
  store_id: string;
  rating: number; // 1~5
  text: string;
  created_at: string;
}

// Supabase 클라이언트 제네릭용 최소 스키마.
// (골격 단계: 실제 컬럼과 1:1로 유지하고, 정교한 Insert/Update 타입은 추후 gen types 로 교체)
export interface Database {
  public: {
    Tables: {
      stores: { Row: Store; Insert: Partial<Store>; Update: Partial<Store> };
      users: { Row: AppUser; Insert: Partial<AppUser>; Update: Partial<AppUser> };
      bookings: { Row: Booking; Insert: Partial<Booking>; Update: Partial<Booking> };
      coupons: { Row: Coupon; Insert: Partial<Coupon>; Update: Partial<Coupon> };
      reviews: { Row: Review; Insert: Partial<Review>; Update: Partial<Review> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
