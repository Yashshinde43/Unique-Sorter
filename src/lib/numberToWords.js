/**
 * Converts a number to Indian English words (Lakhs, Crores system)
 * e.g. 3700000 → "Rs. Thirty Seven Lakhs Only."
 */

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function twoDigits(n) {
  if (n === 0) return '';
  if (n < 20) return ONES[n];
  return TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '');
}

function threeDigits(n) {
  if (n === 0) return '';
  if (n < 100) return twoDigits(n);
  return ONES[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + twoDigits(n % 100) : '');
}

export function numberToWords(amount) {
  const n = Math.round(amount);
  if (n === 0) return 'Rs. Zero Only.';

  let remainder = n;
  const parts = [];

  const crore = Math.floor(remainder / 10_000_000);
  remainder %= 10_000_000;

  const lakh = Math.floor(remainder / 100_000);
  remainder %= 100_000;

  const thousand = Math.floor(remainder / 1_000);
  remainder %= 1_000;

  if (crore)   parts.push(twoDigits(crore) + ' Crore');
  if (lakh)    parts.push(twoDigits(lakh) + ' Lakh');
  if (thousand) parts.push(twoDigits(thousand) + ' Thousand');
  if (remainder) parts.push(threeDigits(remainder));

  return 'Rs. ' + parts.join(' ') + ' Only.';
}

export function formatINR(amount) {
  if (!amount && amount !== 0) return '';
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
