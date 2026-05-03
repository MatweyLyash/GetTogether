interface ApiPromotion {
  id?: number;
  type: string;
  expires_at: string;
}

const PRIORITY: Record<string, number> = {
  premium: 4,
  repeat: 3,
  boost: 2,
  one_time: 1,
};

export function mapPromotion(
  promotions?: ApiPromotion[] | null
): { type: 'one_time' | 'boost' | 'repeat' | 'premium'; expires_at: string } | null {
  if (!promotions || promotions.length === 0) return null;
  const sorted = [...promotions].sort(
    (a, b) => (PRIORITY[b.type] || 0) - (PRIORITY[a.type] || 0)
  );
  const best = sorted[0];
  return {
    type: best.type as 'one_time' | 'boost' | 'repeat' | 'premium',
    expires_at: best.expires_at,
  };
}
