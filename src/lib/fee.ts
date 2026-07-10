// 짐투고 요금 산식 — 공모전 문서 기준 (기본요금 1,000 + 시간당 1,000)
// 정산: 점주 95% / 플랫폼 5%
// A형 시그니처 메뉴 할인 쿠폰: 5,000원 (점주 반환 정산 3,000원)

export const BASE_FEE = 1000; // 기본요금
export const HOURLY_FEE = 1000; // 시간당 요금
export const OWNER_SETTLEMENT_RATE = 0.95; // 점주 정산 비율
export const A_TYPE_COUPON_VALUE = 5000; // A형 식사 할인 쿠폰 액면가
export const A_TYPE_COUPON_REFUND = 3000; // A형 쿠폰 점주 반환 정산액

/**
 * 보관 요금 계산.
 * @param hours 이용 시간(시간 단위). 1시간 미만은 1시간으로 올림.
 * @returns 총 요금(원)
 */
export function calcStorageFee(hours: number): number {
  const billableHours = Math.max(1, Math.ceil(hours));
  return BASE_FEE + HOURLY_FEE * billableHours;
}

/**
 * 두 시각 사이의 요금 계산 (체크인 ~ 체크아웃).
 */
export function calcFeeBetween(checkinAt: Date, checkoutAt: Date): number {
  const ms = checkoutAt.getTime() - checkinAt.getTime();
  const hours = ms / (1000 * 60 * 60);
  return calcStorageFee(hours);
}

/** 점주 정산액(95%) */
export function ownerSettlement(fee: number): number {
  return Math.round(fee * OWNER_SETTLEMENT_RATE);
}
