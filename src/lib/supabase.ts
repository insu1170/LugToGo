import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// .env 값이 "비어 있음(빈 문자열)"일 수도 있으므로 ?? 가 아니라 || 로 폴백합니다.
// (?? 는 null/undefined 만 걸러서 "" 를 그대로 통과시켜 createClient 가 예외를 던짐)
const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const url = rawUrl || "http://localhost:54321";
const anonKey = rawKey || "public-anon-key-placeholder";

// 키가 아직 비어 있어도 앱이 죽지 않도록 경고만 남깁니다 (골격 단계).
if (!rawUrl || !rawKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 비어 있습니다. " +
      "지금은 목데이터로 동작합니다. 실제 연동 시 .env 를 채우세요.",
  );
}

export const supabase = createClient<Database>(url, anonKey);
