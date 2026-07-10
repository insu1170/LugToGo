# 짐투고 · LugToGo

지도에서 짐 보관 가맹점을 찾아 → 예약 → 점주 승인 → 체크인 → 체크아웃까지
한 사이클을 도는 모바일 웹앱(PWA) 프로토타입.

**스택:** React + Vite + TypeScript + Tailwind + shadcn/ui + React Router + Supabase + 네이버 지도

---

## 0. 사전 준비 — Node.js 설치 (⚠️ 아직 안 깔려 있음)

이 프로젝트는 Node.js 가 있어야 실행됩니다. 현재 PC에 설치돼 있지 않으니 먼저 설치하세요.

1. https://nodejs.org 에서 **LTS 버전(20 이상)** 설치 (Windows Installer)
2. 새 터미널을 열고 확인:
   ```powershell
   node -v   # v20.x 이상이면 OK
   npm -v
   ```

## 1. 실행

```powershell
npm install          # 의존성 설치 (최초 1회, 몇 분 소요)
Copy-Item .env.example .env   # 환경변수 파일 생성 후 키 채우기
npm run dev          # http://localhost:5173
```

> 키(`.env`)를 비워둔 채로도 앱은 뜹니다. 이때 매장은 임시 목데이터(광안리 곤국·히로)로,
> 지도는 "키 필요" 안내로 대체됩니다. 골격 확인용으로 충분합니다.

같은 와이파이의 폰에서 확인하려면:
```powershell
npm run dev -- --host   # 뜬 주소(예: http://192.168.0.10:5173)를 폰 브라우저에 입력
```

## 2. 키 발급 (초안 이후 단계)

| 키 | 발급처 | .env 변수 |
|---|---|---|
| Supabase URL / anon key | supabase.com → Project Settings → API | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| 네이버 지도 Client ID | 네이버클라우드 콘솔 → Maps → Application | `VITE_NAVER_MAP_CLIENT_ID` |

- 네이버 지도: 콘솔의 Application > **Web 서비스 URL** 에 `http://localhost:5173` 과 배포 도메인을 등록해야 지도가 뜹니다. (Client Secret 은 프론트엔드에 넣지 않음)
- Supabase: `supabase/schema.sql` → `supabase/seed.sql` 을 SQL Editor 에 순서대로 실행하면 테이블 6개와 광안리 매장이 생성됩니다.

## 3. 폴더 구조

```
src/
├── components/
│   ├── ui/        # shadcn 원자 (button, input, dialog, card, badge)
│   └── blocks/    # 도메인 없는 조각 (header, bottom-nav, store-card, filter-chips, rating-badge)
├── features/      # 도메인 단위 (auth · map · booking …) — hooks/ + ui/
│   ├── auth/
│   ├── map/       # 네이버 지도 로더, 매장 훅, 라벨 마커
│   └── booking/   # 보관만/보관+식사 선택 팝업
├── lib/           # supabase 클라이언트, 요금 계산(fee.ts), cn 유틸
├── types/         # database.ts (6개 테이블 타입)
├── pages/         # 화면 (MapPage, StoreDetailPage, LoginPage, owner/…)
├── App.tsx        # 라우팅
└── main.tsx       # 진입점
```

## 4. 지금 골격에 들어있는 것 / 아직 빈 것

**들어있음 (뼈대):** 지도 화면·유형 필터·매장 카드/상세, 보관만/보관+식사 선택 팝업 + 요금 미리보기,
로그인 폼, 점주 대시보드 레이아웃, 요금 산식(`1,000+1,000×T`)·정산(95%) 로직, DB 스키마·시드.

**아직 TODO(코드 내 `TODO:` 주석 참고):** 실제 예약 insert, Realtime 승인, 체크인 카메라 업로드,
보관중 카운트다운, 리뷰 저장, GPS 현위치, 카카오 로그인 연동.

## 5. 배포 (Vercel)

GitHub 에 push → Vercel 에서 Import → 환경변수(`VITE_*`) 입력 → 자동 배포(HTTPS).
카메라 API 는 HTTPS 에서만 동작하므로 실기기 테스트는 Vercel 주소로 하세요.
