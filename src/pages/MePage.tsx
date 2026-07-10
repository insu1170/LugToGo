import { Header } from "@/components/blocks/header";
import { BottomNav } from "@/components/blocks/bottom-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";

/** 내 정보 — 로그인 상태 + 주소 등록(숙소/주거지) 폼. TODO: users 테이블 upsert */
export function MePage() {
  const { user, signOut } = useAuth();

  return (
    <div className="flex h-full flex-col">
      <Header title="내 정보" />
      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        {user ? (
          <p className="text-sm">
            로그인: <span className="font-medium">{user.email}</span>
          </p>
        ) : (
          <Link to="/login">
            <Button className="w-full" size="lg">
              로그인 / 회원가입
            </Button>
          </Link>
        )}

        <section className="space-y-2">
          <h3 className="font-semibold">주소 등록</h3>
          <Input placeholder="숙소 주소" />
          <Input placeholder="주거지 주소" />
          <Button variant="secondary" className="w-full">
            저장
          </Button>
        </section>

        <Link to="/owner" className="block text-sm text-muted-foreground underline">
          점주이신가요? 점주 화면으로 →
        </Link>

        {user && (
          <Button variant="outline" className="w-full" onClick={() => signOut()}>
            로그아웃
          </Button>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
