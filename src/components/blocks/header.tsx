import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  right?: React.ReactNode;
  className?: string;
}

/** 상단 앱바 — 뒤로가기 + 타이틀 + 우측 액션 슬롯 */
export function Header({ title, showBack, right, className }: HeaderProps) {
  const navigate = useNavigate();
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur",
        className,
      )}
    >
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="grid h-9 w-9 place-items-center rounded-full hover:bg-accent"
          aria-label="뒤로"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      <h1 className="flex-1 truncate text-base font-semibold">{title}</h1>
      {right}
    </header>
  );
}
