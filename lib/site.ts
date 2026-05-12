export const SITE_NAME = 'ORABIT';
export const SITE_DOMAIN = 'orabit.info';
export const DEFAULT_SITE_URL = `https://${SITE_DOMAIN}`;

export const SITE_TITLE = 'ORABIT | 사주 오행 보석 리포트';
export const SITE_DESCRIPTION =
  '사주명리학의 오행 구조를 바탕으로 나의 성향, 균형 포인트, 어울리는 보석/주얼리 조합을 제안하는 감성형 자기이해 리포트입니다.';

export function getPublicSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
}
