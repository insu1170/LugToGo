-- 짐투고(LugToGo) DB 스키마 — 계획서 §4 (6개 테이블)
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 실행하세요.
-- (관리자 페이지 없이 이 스키마 + 대시보드 직접 입력으로 운영)

-- ── stores : 가맹점 ────────────────────────────────────────────
create table if not exists public.stores (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  lat                 double precision not null,
  lng                 double precision not null,
  type                text not null default '기본' check (type in ('A','B','C','기본')),
  open_time           text not null default '09:00',
  close_time          text not null default '22:00',
  capacity            int  not null default 5,
  is_accepting        boolean not null default true,   -- 보관 접수 On/Off
  photos              text[] not null default '{}',
  menu                jsonb  not null default '[]',     -- [{name, price, isSignature}]
  signature_discount  int,                             -- A형: 5000
  avg_rating          numeric(2,1) not null default 0, -- reviews 로 자동 갱신
  created_at          timestamptz not null default now()
);

-- ── users : 앱 사용자 (Supabase Auth 확장 프로필) ───────────────
create table if not exists public.users (
  id           uuid primary key references auth.users(id) on delete cascade,
  role         text not null default 'user' check (role in ('user','owner')),
  phone        text,
  lodging_addr text,
  home_addr    text
);

-- ── bookings : 예약/보관 ───────────────────────────────────────
create table if not exists public.bookings (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.users(id) on delete cascade,
  store_id          uuid not null references public.stores(id) on delete cascade,
  plan              text not null check (plan in ('보관만','보관+식사')),
  status            text not null default '대기'
                      check (status in ('대기','승인','체크인','보관중','완료','거절','만료')),
  approved_at       timestamptz,
  checkin_at        timestamptz,
  checkout_at       timestamptz,
  fee               int,
  nametag_no        text,                              -- 4자리
  photo_urls        text[] not null default '{}',      -- 짐 촬영(면책)
  disclaimer_agreed boolean not null default false,
  created_at        timestamptz not null default now()
);

-- ── coupons : A형 식사 할인 쿠폰 (월 1회 제한) ──────────────────
create table if not exists public.coupons (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users(id) on delete cascade,
  store_id      uuid not null references public.stores(id) on delete cascade,
  type          text not null default 'A' check (type in ('A')),
  value         int  not null default 5000,
  expires_at    timestamptz not null,                  -- 당월 말일
  used_at       timestamptz,
  issued_month  text not null,                         -- 'YYYY-MM'
  -- 계정당 동일 매장 월 1회 제한
  unique (user_id, store_id, issued_month)
);

-- ── reviews : 방명록 ───────────────────────────────────────────
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null references public.bookings(id) on delete cascade,
  store_id    uuid not null references public.stores(id) on delete cascade,
  rating      int  not null check (rating between 1 and 5),
  text        text not null default '',
  created_at  timestamptz not null default now()
);

-- ── counters (뷰) : 매장별 현재 보관중 수 / 잔여 칸 ────────────
create or replace view public.store_counters as
select
  s.id                                             as store_id,
  s.capacity                                       as capacity,
  count(b.id) filter (
    where b.status in ('체크인','보관중')
  )                                                as in_storage,
  greatest(0, s.capacity - count(b.id) filter (
    where b.status in ('체크인','보관중')
  ))                                               as remaining
from public.stores s
left join public.bookings b on b.store_id = s.id
group by s.id, s.capacity;

-- ── 리뷰 저장 시 매장 평점 자동 갱신 트리거 ───────────────────
create or replace function public.refresh_store_rating()
returns trigger language plpgsql as $$
begin
  update public.stores s
  set avg_rating = coalesce(
    (select round(avg(r.rating)::numeric, 1) from public.reviews r where r.store_id = s.id),
    0
  )
  where s.id = coalesce(new.store_id, old.store_id);
  return null;
end;
$$;

drop trigger if exists trg_refresh_rating on public.reviews;
create trigger trg_refresh_rating
after insert or update or delete on public.reviews
for each row execute function public.refresh_store_rating();

-- ── RLS (프로토타입: 우선 열어두고, 시연 후 조여도 됨) ─────────
-- 초기엔 편의를 위해 anon 읽기 허용. 실서비스 전에 반드시 정책을 강화하세요.
alter table public.stores  enable row level security;
create policy "stores read" on public.stores for select using (true);
