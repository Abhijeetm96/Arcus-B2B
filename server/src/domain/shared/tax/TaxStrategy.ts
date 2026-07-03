import { Money } from '../Money';

export interface TaxCalculationResult {
  taxableAmount: Money;
  taxAmount: Money;
  breakdown: {
    cgst?: Money;
    sgst?: Money;
    igst?: Money;
    exempt?: Money;
  };
}

export interface TaxStrategy {
  calculateTax(taxableAmount: Money, ratePercent: number): TaxCalculationResult;
}
