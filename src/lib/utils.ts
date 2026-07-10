import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** shadcn/ui 표준 className 병합 헬퍼 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 1,000 형태의 원화 표기 */
export function formatWon(won: number): string {
  return `${won.toLocaleString("ko-KR")}원`;
}
