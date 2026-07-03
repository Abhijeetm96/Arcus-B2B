import { Money } from '../Money';
import { TaxStrategy, TaxCalculationResult } from './TaxStrategy';

export class GSTStrategy implements TaxStrategy {
  private readonly isInterstate: boolean;

  constructor(isInterstate: boolean) {
    this.isInterstate = isInterstate;
  }

  public calculateTax(taxableAmount: Money, ratePercent: number): TaxCalculationResult {
    const currency = taxableAmount.getCurrency();
    const precision = taxableAmount.getPrecision();
    const totalTax = taxableAmount.getAmount() * (ratePercent / 100);
    const taxMoney = new Money(totalTax, currency, precision);

    if (this.isInterstate) {
      return {
        taxableAmount,
        taxAmount: taxMoney,
        breakdown: {
          igst: taxMoney
        }
      };
    } else {
      const halfTax = totalTax / 2;
      const cgst = new Money(halfTax, currency, precision);
      const sgst = new Money(halfTax, currency, precision);
      return {
        taxableAmount,
        taxAmount: cgst.add(sgst),
        breakdown: {
          cgst,
          sgst
        }
      };
    }
  }
}
