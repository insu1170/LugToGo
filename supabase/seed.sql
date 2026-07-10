-- 광안리 테스트 매장 시드 (D2). schema.sql 실행 후 돌리세요.
-- 좌표는 대략치입니다 — 네이버 지도에서 실좌표를 찍어 교체하세요.

insert into public.stores (name, lat, lng, type, open_time, close_time, capacity, is_accepting, menu, signature_discount, avg_rating)
values
  ('곤국', 35.1532, 129.1187, 'A', '10:00', '22:00', 5, true,
   '[{"name":"시그니처 곤이국밥","price":12000,"isSignature":true},{"name":"공기밥","price":1000,"isSignature":false}]'::jsonb,
   5000, 4.3),
  ('히로', 35.1541, 129.1163, 'A', '11:00', '21:00', 4, true,
   '[{"name":"히로 정식","price":15000,"isSignature":true}]'::jsonb,
   5000, 5.0),
  ('광안리 보관카페', 35.1528, 129.1201, '기본', '09:00', '23:00', 6, false,
   '[]'::jsonb, null, 4.0);
