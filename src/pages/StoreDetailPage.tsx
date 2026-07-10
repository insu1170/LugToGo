import { useParams } from "react-router-dom";
import { Header } from "@/components/blocks/header";
import { useStores } from "@/features/map/hooks/useStores";
import { StoreDetailContent } from "@/features/store/ui/StoreDetailContent";

/** 매장 상세 라우트 (직접 링크·공유 접근용). 지도 위 미리보기는 MapBottomSheet 참고. */
export function StoreDetailPage() {
  const { id } = useParams();
  const { stores } = useStores();
  const store = stores.find((s) => s.id === id);

  if (!store) {
    return (
      <div className="flex h-full flex-col">
        <Header title="매장" showBack />
        <p className="p-6 text-center text-sm text-muted-foreground">
          매장을 찾을 수 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <Header title={store.name} showBack />
      <StoreDetailContent store={store} />
    </div>
  );
}
