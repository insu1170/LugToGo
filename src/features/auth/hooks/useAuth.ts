import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

/**
 * 로그인 세션 훅.
 * - 지금은 이메일/비밀번호(Supabase Auth) 기준으로 세션만 노출합니다.
 * - 카카오 로그인은 추후 supabase.auth.signInWithOAuth({ provider: "kakao" }) 로 추가 (뼈대만).
 */
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return {
    session,
    user: session?.user ?? null,
    loading,
    signInWithEmail: (email: string, password: string) =>
      supabase.auth.signInWithPassword({ email, password }),
    signUpWithEmail: (email: string, password: string) =>
      supabase.auth.signUp({ email, password }),
    // TODO(카카오): 카카오 개발자 콘솔 + Supabase Auth Provider 설정 후 활성화
    signInWithKakao: () =>
      supabase.auth.signInWithOAuth({ provider: "kakao" }),
    signOut: () => supabase.auth.signOut(),
  };
}
