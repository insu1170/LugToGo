import type { ReactNode } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** 브라우저 alert() 대체용 — 확인 버튼 하나짜리 커스텀 안내 모달 */
export function AlertModal({
  open,
  onOpenChange,
  title,
  children,
  confirmLabel = "확인",
  variant = "success",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  children?: ReactNode;
  confirmLabel?: string;
  variant?: "success" | "error";
}) {
  const Icon = variant === "error" ? AlertTriangle : CheckCircle2;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="items-center text-center">
          <Icon
            className={cn(
              "mb-1 h-10 w-10",
              variant === "error" ? "text-destructive" : "text-primary",
            )}
          />
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
        <Button className="mt-4 w-full" size="lg" onClick={() => onOpenChange(false)}>
          {confirmLabel}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
