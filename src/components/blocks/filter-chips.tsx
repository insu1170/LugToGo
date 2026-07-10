import { cn } from "@/lib/utils";

// 필터는 [전체]와 [A형 골드] 두 가지만 사용.
export type StoreFilter = "전체" | "A";

const FILTERS: { value: StoreFilter; label: string }[] = [
  { value: "전체", label: "전체" },
  { value: "A", label: "A형 골드" },
];

/**
 * 지도 위에 떠 있는 유형 필터 칩 (네이버지도 모바일 스타일).
 * A형 클릭 시 A형만 지도에 남고, 기본은 전체.
 */
export function FilterChips({
  value,
  onChange,
}: {
  value: StoreFilter;
  onChange: (v: StoreFilter) => void;
}) {
  return (
    <div className="flex gap-2">
      {FILTERS.map((f) => {
        const active = value === f.value;
        const gold = f.value === "A";
        return (
          <button
            key={f.value}
            onClick={() => onChange(f.value)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium shadow-sm transition-colors",
              active && gold && "border-lug-gold bg-lug-gold text-black",
              active && !gold && "border-primary bg-primary text-primary-foreground",
              !active && "border-black/5 bg-white text-foreground",
            )}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
