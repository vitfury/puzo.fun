export interface PointTransaction {
  id: number;
  amount: number;
  reason: string;
  source_type: string | null;
  source_id: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface PointsBalance {
  balance: number;
}
