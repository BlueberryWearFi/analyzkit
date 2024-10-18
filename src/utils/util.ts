export function riposte<T>(...args: [cond: boolean, value: T][]): T {
  for (const [cond, value] of args) {
    if (cond)
      return value
  }
  return undefined as T
}

export function arange(x1: number, x2?: number, stp = 1, z: number[] = [], z0 = z.length) {
  if (!x2)
    x1 -= x2 = x1
  for (let z1 = z0 + Math.max(Math.ceil((++x2 - x1) / stp), 0); z0 < z1; x1 += stp) z[z0++] = x1
  return z
}
