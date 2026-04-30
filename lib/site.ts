export const SITE_NAME = 'ORABIT';
export const SITE_DOMAIN = 'orabit.info';
export const DEFAULT_SITE_URL = `https://${SITE_DOMAIN}`;

export const SITE_TITLE = 'ORABIT | 사주 에너지 분석과 주얼리 큐레이션';
export const SITE_DESCRIPTION =
  '사주의 오행 흐름을 분석해 부족한 기운, 과한 기운, 그리고 이를 보완할 수 있는 색상, 보석, 주얼리 조합을 제안합니다.';

export function getPublicSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
}
