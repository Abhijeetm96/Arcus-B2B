import { Money } from '../Money';
import { TaxStrategy, TaxCalculationResult } from './TaxStrategy';

export class ExemptStrategy implements TaxStrategy {
  public calculateTax(taxableAmount: Money, _ratePercent: number): TaxCalculationResult {
    const currency = taxableAmount.getCurrency();
    const precision = taxableAmount.getPrecision();
    const zeroTax = new Money(0, currency, precision);

    return {
      taxableAmount,
      taxAmount: zeroTax,
      breakdown: {
        exempt: zeroTax
      }
    };
  }
}
