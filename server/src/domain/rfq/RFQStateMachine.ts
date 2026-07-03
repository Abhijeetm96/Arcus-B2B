import { RFQStatus } from './RFQConstants';

export class RFQStateMachine {
  private static readonly transitions: Record<RFQStatus, RFQStatus[]> = {
    [RFQStatus.DRAFT]: [RFQStatus.SUBMITTED],
    [RFQStatus.SUBMITTED]: [RFQStatus.ASSIGNED, RFQStatus.REJECTED, RFQStatus.EXPIRED],
    [RFQStatus.ASSIGNED]: [RFQStatus.UNDER_REVIEW, RFQStatus.REJECTED, RFQStatus.EXPIRED],
    [RFQStatus.UNDER_REVIEW]: [RFQStatus.NEGOTIATION, RFQStatus.REJECTED, RFQStatus.EXPIRED],
    [RFQStatus.NEGOTIATION]: [RFQStatus.APPROVED, RFQStatus.REJECTED, RFQStatus.EXPIRED],
    [RFQStatus.APPROVED]: [RFQStatus.CONVERTED, RFQStatus.EXPIRED],
    [RFQStatus.REJECTED]: [RFQStatus.DRAFT], 
    [RFQStatus.EXPIRED]: [],
    [RFQStatus.CONVERTED]: []
  };

  /**
   * Validates if a transition from currentStatus to targetStatus is legally permitted.
   */
  public static canTransition(currentStatus: RFQStatus, targetStatus: RFQStatus): boolean {
    if (currentStatus === targetStatus) return true;
    const allowed = this.transitions[currentStatus] || [];
    return allowed.includes(targetStatus);
  }

  /**
   * Retrieves the array of valid statuses that can be reached from the current status.
   */
  public static getAllowedTransitions(currentStatus: RFQStatus): RFQStatus[] {
    return this.transitions[currentStatus] || [];
  }
}
