export class Money {
  private readonly amount: number;
  private readonly currency: string;
  private readonly precision: number;

  constructor(amount: number, currency = 'INR', precision = 2) {
    this.amount = Number(Number(amount).toFixed(precision));
    this.currency = currency.toUpperCase();
    this.precision = precision;
  }

  public getAmount(): number {
    return this.amount;
  }

  public getCurrency(): string {
    return this.currency;
  }

  public getPrecision(): number {
    return this.precision;
  }

  public add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount + other.getAmount(), this.currency, this.precision);
  }

  public subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount - other.getAmount(), this.currency, this.precision);
  }

  public multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency, this.precision);
  }

  public toBase(exchangeRate: number, baseCurrency = 'INR'): Money {
    return new Money(this.amount * exchangeRate, baseCurrency, this.precision);
  }

  public format(): string {
    const symbol = this.getCurrencySymbol();
    const formattedAmount = this.amount.toLocaleString(this.currency === 'INR' ? 'en-IN' : 'en-US', {
      minimumFractionDigits: this.precision,
      maximumFractionDigits: this.precision
    });
    return `${symbol}${formattedAmount}`;
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.getCurrency()) {
      throw new Error(`Currency mismatch: Cannot operate on ${this.currency} and ${other.getCurrency()}`);
    }
  }

  private getCurrencySymbol(): string {
    switch (this.currency) {
      case 'INR': return '₹';
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'AED': return 'AED ';
      default: return `${this.currency} `;
    }
  }
}
