/* eslint-disable ts/no-use-before-define */
import BigNumber from 'bignumber.js'
import { formatEther as _formatEther } from 'ethers-v5/lib/utils'

export function percentage(total: BigNumber.Value, count: BigNumber.Value, decimalPlaces = 3) {
  if (+total === 0 || +count === 0)
    return 0

  return +new BigNumber(count || '0')
    .div(total || '0')
    .times(100)
    .toFixed(decimalPlaces, BigNumber.ROUND_DOWN)
}

export function plus(array: (string | number)[]): string {
  return array
    .filter(v => typeof v !== 'undefined')
    .reduce((total, currentValue) => {
      return total.plus(currentValue)
    }, new BigNumber(0))
    .toFixed(0)
}

export function formatEtherByFormat(value: any, decimalPlaces = 3) {
  if (!value)
    return '0.00'
  return format(formatEther(value), decimalPlaces)
}

export function formatEther(value: any = '0') {
  const number = (value as any).toFixed?.(0) || value.toString?.() || value

  return _formatEther(new BigNumber(number === 'NaN' ? 0 : number).toFixed(0))
}

export function format(value: BigNumber.Value = '0', decimalPlaces = 3) {
  const config = parse(value)
  const string = new BigNumber(value).div(config.v).toFormat(decimalPlaces)
  return `${string}${config.n}`
}

export function gte(num: BigNumber.Value, n: number) {
  return new BigNumber(num).gte(n)
}
export function lt(num: BigNumber.Value, n: number) {
  return new BigNumber(num).lt(n)
}

export function parse(n: BigNumber.Value) {
  let options: { v: number, d: number, n: string } | undefined
  for (const analy of BIG_NUM_MAPPINGS) {
    const opts = analy(new BigNumber(n).toFixed(0))
    if (opts)
      options = opts
  }
  return options || { v: 1, d: 0, n: '' }
}

export function average(numbers: number[]) {
  if (numbers.length === 0)
    return 0
  return (numbers.reduce((sum, number) => sum + number, 0) / numbers.length)
}

const BigInts = {
  t: { v: 10 ** 12, d: 13, n: 't' },
  b: { v: 10 ** 9, d: 10, n: 'b' },
  m: { v: 10 ** 6, d: 7, n: 'm' },
}

const BIG_NUM_MAPPINGS = [
  (n: BigNumber.Value) => gte(n, BigInts.t.v) && BigInts.t,
  (n: BigNumber.Value) => gte(n, BigInts.b.v) && lt(n, BigInts.t.v) && BigInts.b,
  (n: BigNumber.Value) => gte(n, BigInts.m.v) && lt(n, BigInts.b.v) && BigInts.m,
  // (n: BigNumber.Value) => gte(n, BigInts.k.v) && lt(n, BigInts.m.v) && BigInts.k,
]
