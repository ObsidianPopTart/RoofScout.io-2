const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const num = new Intl.NumberFormat("en-US");

export function money(n: number): string {
  return usd.format(n);
}

export function moneyCompact(n: number): string {
  if (Math.abs(n) >= 10000) return `$${Math.round(n / 1000)}k`;
  return usd.format(n);
}

export function number(n: number): string {
  return num.format(n);
}
