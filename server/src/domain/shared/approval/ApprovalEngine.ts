import { PoolClient } from 'pg';

export interface ApprovalPolicyResult {
  requiresApproval: boolean;
  requiredRole: string | null;
  requiredLevels: number;
}

export class ApprovalEngine {
  /**
   * Evaluates if a document value triggers approval policies, returning sign-off requirements.
   *
   * @param {PoolClient} client - The active database client client.
   * @param {string} entityType - The document class (e.g. 'QUOTATION', 'ORDER').
   * @param {number} amount - The grand total value in INR.
   * @returns {Promise<ApprovalPolicyResult>} Sign-off role and levels required.
   */
  public static async evaluateApprovalRequirements(
    client: PoolClient,
    entityType: string,
    amount: number
  ): Promise<ApprovalPolicyResult> {
    const res = await client.query(`
      SELECT * FROM approval_policies 
      WHERE entity_type = $1 AND min_amount <= $2 AND max_amount >= $2
      LIMIT 1
    `, [entityType, amount]);

    if (res.rows.length === 0) {
      // Default fallback rule if no policy matches
      return {
        requiresApproval: amount > 100000, // require approval for items above 100k
        requiredRole: 'SALES_MANAGER',
        requiredLevels: 1
      };
    }

    const policy = res.rows[0];
    return {
      requiresApproval: true,
      requiredRole: policy.required_role,
      requiredLevels: policy.required_levels
    };
  }
}
