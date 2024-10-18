import dayjs from 'dayjs'
import { arange, getTimePoints } from './utils'

export interface TimeOptions {
  difference?: number
  startOf?: number
  endOf?: number
}

export function day<T>(date: number, array: readonly T[], options?: TimeOptions) {
  const data = time(date, array, 'd', options)
  const day = dayjs.unix(date).format('MM/DD')
  const ytd = dayjs.unix(date).format('YYYY-MM-DD')
  return {
    date,
    data,
    day,
    ytd,
  }
}

export function week<T>(date: number, array: readonly T[], options?: TimeOptions) {
  return time(date, array, 'w', options)
}

export function month<T>(date: number, array: readonly T[], options?: TimeOptions) {
  return time(date, array, 'M', options)
}

export function hours<T>(array: readonly T[], difference = 3600) {
  const last: any = array[array.length - 1]
  const fast: any = array[0]

  const range = [
    dayjs.unix(fast?.date || 0).startOf('d').unix(),
    dayjs.unix(last?.date || 0).endOf('d').unix(),
  ]
  return arange(range[0], range[1], difference)
    .map((date) => {
      const time = dayjs.unix(date)
      const data = array.filter((item: any) =>
        item.date > date && item.date < (date + difference),
      )
      return {
        hour: time.format('HH:mm'),
        time,
        data,
      }
    })
}

export function daily<T>(array: readonly T[]) {
  return [...new Set([...array.map(formatDaily)])]
    .map(dt => dayjs(dt, 'YYYY-MM-DD').unix())
    .map(date => day(date, array))
}

export function fills<T>(date: number, array: readonly T[], unit: 'h' | 'w' | 'M', defaultValue: Partial<T>) {
  const key = { h: 'hour', w: 'day', M: 'day' }[unit]
  const mapping = new Map<string, T>()
  let points: Record<string, any>[] = []

  if (unit === 'h') {
    const one = dayjs((array[0] as any).hour, 'HH:mm')
    const two = dayjs((array[1] as any).hour, 'HH:mm')
    points = getTimePoints(two.diff(one, 'seconds')).map(point => ({ [key]: point }))
  }
  if (unit === 'M') {
    const specifiedDate = dayjs.unix(date)
    const daysInMonth = specifiedDate.daysInMonth()
    points = arange(1, daysInMonth)
      .map(date => specifiedDate.date(date))
      .map(date => ({ [key]: date.format('MM/DD'), ytd: date.format('YYYY-MM-DD'), date: date.unix() }))
  }

  if (unit === 'w') {
    const specifiedDate = dayjs.unix(date)
    points = arange(0, 6)
      .map(date => specifiedDate.day(date))
      .map(date => ({ [key]: date.format('MM/DD'), ytd: date.format('YYYY-MM-DD'), date: date.unix() }))
  }

  for (const point of points)
    mapping.set(point[key], { ...point, ...defaultValue as T })

  for (const item of array as any[])
    mapping.set(item[key], item)

  return [...mapping.values()]
}

export function time<T>(date: number, array: readonly T[], unit: dayjs.OpUnitType, options?: TimeOptions) {
  const difference = options?.difference || 0
  const startOf = (options?.startOf || dayjs.unix(date).startOf(unit).unix()) + difference
  const endOf = (options?.endOf || dayjs.unix(date).endOf(unit).unix()) + difference
  return array.filter((item: any) => item.date > startOf && item.date < endOf)
}

export function diff<T>(date: number, array: readonly T[], difference = 3600) {
  const grouped = diffs(array, difference)
  const ytd = dayjs.unix(date).format('YYYY-MM-DD')
  const day = dayjs.unix(date).format('MM/DD')
  const find = grouped.find(group => group.ytd === ytd)
  const data = find?.data || []
  return { data, ytd, date, day }
}

export function diffs<T>(array: readonly T[], difference = 3600, repeat = false) {
  const grouped: T[][] = []
  const _array = [...array] as any[]

  _array.sort((a, b) => a.date - b.date)

  let group: any[] = [_array[0]].filter(Boolean)
  for (let i = 1; i < _array.length; i++) {
    if (_array[i].date - group[group.length - 1].date <= difference) {
      group.push(_array[i])
    }
    else {
      grouped.push(group)
      group = [_array[i]]
    }
  }
  if (group.length > 0)
    grouped.push(group)

  if (repeat) {
    return grouped.map((data) => {
      const date: number = (data as any).at(-1).date
      const ytd = dayjs.unix(date).format('YYYY-MM-DD')
      const day = dayjs.unix(date).format('MM/DD')
      return { date, data, ytd, day }
    })
  }

  const mappings = new Map<string, { date: number, data: T[], ytd: string, day: string }>()

  for (const data of grouped) {
    const date: number = (data as any).at(-1).date
    const ytd = dayjs.unix(date).format('YYYY-MM-DD')
    const day = dayjs.unix(date).format('MM/DD')

    const prev = mappings.get(ytd)?.data || []
    if (prev.length > data.length)
      continue
    mappings.set(ytd, { data, date, ytd, day })
  }

  return [...mappings.values()]
}

function formatDaily(item: any) {
  return dayjs.unix(item.date).format('YYYY-MM-DD')
}
