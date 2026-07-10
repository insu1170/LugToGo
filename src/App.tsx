import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MapPage } from "@/pages/MapPage";
import { StoreDetailPage } from "@/pages/StoreDetailPage";
import { LoginPage } from "@/pages/LoginPage";
import { BookingsPage } from "@/pages/BookingsPage";
import { MePage } from "@/pages/MePage";
import { OwnerDashboardPage } from "@/pages/owner/OwnerDashboardPage";

/**
 * 라우팅 — 유저 화면과 점주 화면을 한 프로젝트에서 경로로 분리 (계획서 §3).
 *  /              지도 (홈)
 *  /store/:id     매장 상세
 *  /login         로그인/회원가입
 *  /me            내 정보 · 주소
 *  /me/bookings   내 예약
 *  /owner         점주 대시보드
 */
export default function App() {
  return (
    <BrowserRouter>
      {/* 모바일 웹앱: 가운데 정렬된 폰 폭 컨테이너 */}
      <div className="mx-auto flex h-full max-w-md flex-col bg-background shadow-sm">
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/store/:id" element={<StoreDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/me" element={<MePage />} />
          <Route path="/me/bookings" element={<BookingsPage />} />
          <Route path="/owner" element={<OwnerDashboardPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
