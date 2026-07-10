import { useEffect, useState } from "react";

// 네이버 지도 Web Dynamic Map(JS SDK)을 런타임에 동적으로 로드하는 훅.
// 새 인증 방식: 호스트 oapi.map.naver.com + 파라미터 ncpKeyId(Client ID).
// index.html 에 <script> 를 직접 넣지 않고, .env 의 Client ID 로 여기서 주입합니다.

const CLIENT_ID = import.meta.env.VITE_NAVER_MAP_CLIENT_ID as string | undefined;
const SDK_ID = "naver-map-sdk";

declare global {
  interface Window {
    naver: any;
  }
}

export type NaverLoadState = "idle" | "loading" | "ready" | "no-key" | "error";

export function useNaverLoader(): NaverLoadState {
  const [state, setState] = useState<NaverLoadState>("idle");

  useEffect(() => {
    if (!CLIENT_ID) {
      setState("no-key");
      return;
    }
    if (window.naver?.maps) {
      setState("ready");
      return;
    }

    setState("loading");
    const onLoad = () => setState("ready");
    const onError = () => setState("error");

    const existing = document.getElementById(SDK_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", onLoad);
      existing.addEventListener("error", onError);
      return () => {
        existing.removeEventListener("load", onLoad);
        existing.removeEventListener("error", onError);
      };
    }

    const script = document.createElement("script");
    script.id = SDK_ID;
    script.async = true;
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${CLIENT_ID}`;
    script.addEventListener("load", onLoad);
    script.addEventListener("error", onError);
    document.head.appendChild(script);

    return () => {
      script.removeEventListener("load", onLoad);
      script.removeEventListener("error", onError);
    };
  }, []);

  return state;
}
