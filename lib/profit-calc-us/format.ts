// lib/profit-calc-us/format.ts

export function formatRate(rate: number): string {
    return ( rate * 100).toFixed(2);
}

export function formatHtsCodeShort(code: string): string {
  const parts = code.split(".");
  if (parts.length <= 2) return code;
  return `${parts[0]}.${parts[1]}`;
}