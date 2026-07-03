import { Money } from './Money';
import { TaxStrategy } from './tax/TaxStrategy';

export interface PricingLineItem {
  quantity: number;
  rate: number;
  discountPercent: number;
  taxPercent: number;
}

export interface PricingResult {
  subtotal: Money;
  discount: Money;
  taxableAmount: Money;
  gstAmount: Money;
  shipping: Money;
  otherCharges: Money;
  grandTotal: Money;
  roundOff: Money;
  items: Array<{
    subtotal: Money;
    discountAmount: Money;
    taxableAmount: Money;
    taxAmount: Money;
    finalAmount: Money;
    taxBreakdown: any;
  }>;
  auditTrail: {
    cgstTotal: number;
    sgstTotal: number;
    igstTotal: number;
    exemptTotal: number;
    subtotalsSum: number;
    discountsSum: number;
    taxablesSum: number;
    gstsSum: number;
    shippingCharges: number;
    otherChargesSum: number;
    rawGrandTotal: number;
    roundedGrandTotal: number;
  };
}

export class PricingEngine {
  public static calculate(
    lineItems: PricingLineItem[],
    shipping: number,
    otherCharges: number,
    taxStrategy: TaxStrategy,
    currency = 'INR'
  ): PricingResult {
    let subtotalSum = 0;
    let discountSum = 0;
    let taxableSum = 0;
    let gstSum = 0;

    let cgstSum = 0;
    let sgstSum = 0;
    let igstSum = 0;
    let exemptSum = 0;

    const calculatedItems = lineItems.map(item => {
      const sub = item.quantity * item.rate;
      const disc = sub * (item.discountPercent / 100);
      const taxable = sub - disc;

      const taxableMoney = new Money(taxable, currency);
      const taxResult = taxStrategy.calculateTax(taxableMoney, item.taxPercent);

      subtotalSum += sub;
      discountSum += disc;
      taxableSum += taxable;
      gstSum += taxResult.taxAmount.getAmount();

      if (taxResult.breakdown.cgst) cgstSum += taxResult.breakdown.cgst.getAmount();
      if (taxResult.breakdown.sgst) sgstSum += taxResult.breakdown.sgst.getAmount();
      if (taxResult.breakdown.igst) igstSum += taxResult.breakdown.igst.getAmount();
      if (taxResult.breakdown.exempt) exemptSum += taxResult.breakdown.exempt.getAmount();

      return {
        subtotal: new Money(sub, currency),
        discountAmount: new Money(disc, currency),
        taxableAmount: taxableMoney,
        taxAmount: taxResult.taxAmount,
        finalAmount: taxableMoney.add(taxResult.taxAmount),
        taxBreakdown: taxResult.breakdown
      };
    });

    const subtotalMoney = new Money(subtotalSum, currency);
    const discountMoney = new Money(discountSum, currency);
    const taxableMoney = new Money(taxableSum, currency);
    const gstMoney = new Money(gstSum, currency);
    const shippingMoney = new Money(shipping, currency);
    const otherChargesMoney = new Money(otherCharges, currency);

    const rawGrandTotal = taxableSum + gstSum + shipping + otherCharges;
    const roundedGrandTotal = Math.round(rawGrandTotal);
    const roundOffDiff = roundedGrandTotal - rawGrandTotal;

    return {
      subtotal: subtotalMoney,
      discount: discountMoney,
      taxableAmount: taxableMoney,
      gstAmount: gstMoney,
      shipping: shippingMoney,
      otherCharges: otherChargesMoney,
      grandTotal: new Money(roundedGrandTotal, currency),
      roundOff: new Money(roundOffDiff, currency),
      items: calculatedItems,
      auditTrail: {
        cgstTotal: Number(cgstSum.toFixed(2)),
        sgstTotal: Number(sgstSum.toFixed(2)),
        igstTotal: Number(igstSum.toFixed(2)),
        exemptTotal: Number(exemptSum.toFixed(2)),
        subtotalsSum: Number(subtotalSum.toFixed(2)),
        discountsSum: Number(discountSum.toFixed(2)),
        taxablesSum: Number(taxableSum.toFixed(2)),
        gstsSum: Number(gstSum.toFixed(2)),
        shippingCharges: shipping,
        otherChargesSum: otherCharges,
        rawGrandTotal: Number(rawGrandTotal.toFixed(2)),
        roundedGrandTotal
      }
    };
  }
}
