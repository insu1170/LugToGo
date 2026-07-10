import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Store } from "@/types/database";
import { MOCK_STORES } from "../mock-stores";

const hasSupabase = Boolean(import.meta.env.VITE_SUPABASE_URL);

/**
 * 매장 목록 조회.
 * - Supabase 키가 있으면 stores 테이블에서 가져오고,
 * - 없으면 MOCK_STORES 로 폴백해 골격 화면이 항상 뜨도록 합니다.
 */
export function useStores() {
  const [stores, setStores] = useState<Store[]>(hasSupabase ? [] : MOCK_STORES);
  const [loading, setLoading] = useState(hasSupabase);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasSupabase) return;
    let alive = true;
    (async () => {
      const { data, error } = await supabase.from("stores").select("*");
      if (!alive) return;
      if (error) {
        setError(error.message);
        setStores(MOCK_STORES); // DB 오류 시에도 화면은 유지
      } else {
        setStores(data ?? []);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  return { stores, loading, error };
}

/**
 * 매장별 잔여 칸 = capacity − 현재 보관중 건수.
 * 골격 단계에서는 임의값(0)을 반환하고, 추후 counters 뷰/집계로 교체합니다.
 * TODO: bookings 중 status in ('체크인','보관중') 카운트로 계산
 */
export function useRemaining(store: Store): number {
  const inStorage = 0;
  return Math.max(0, store.capacity - inStorage);
}
