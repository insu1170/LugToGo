import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/blocks/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/hooks/useAuth";

/** D6 — 로그인/회원가입 (이메일 우선, 카카오는 버튼만 준비) */
export function LoginPage() {
  const { signInWithEmail, signUpWithEmail, signInWithKakao } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  async function submit() {
    setMsg(null);
    const fn = mode === "login" ? signInWithEmail : signUpWithEmail;
    const { error } = await fn(email, password);
    if (error) setMsg(error.message);
    else if (mode === "signup") setMsg("가입 확인 메일을 확인하세요.");
    else navigate("/");
  }

  return (
    <div className="flex h-full flex-col">
      <Header title={mode === "login" ? "로그인" : "회원가입"} showBack />
      <div className="mx-auto w-full max-w-sm space-y-3 p-6">
        <Input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {msg && <p className="text-sm text-destructive">{msg}</p>}

        <Button className="w-full" size="lg" onClick={submit}>
          {mode === "login" ? "로그인" : "회원가입"}
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={() =>
            signInWithKakao().catch(() =>
              setMsg("카카오 로그인은 아직 설정되지 않았습니다."),
            )
          }
        >
          카카오로 계속하기 (설정 예정)
        </Button>

        <button
          className="w-full text-sm text-muted-foreground underline"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login" ? "계정이 없으신가요? 회원가입" : "이미 계정이 있으신가요? 로그인"}
        </button>
      </div>
    </div>
  );
}
