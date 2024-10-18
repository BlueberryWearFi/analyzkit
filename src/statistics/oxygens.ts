import dayjs from 'dayjs'
import { Data } from '../types'
import * as utils from '../utils'
import * as ratings from '../ratings'
import * as groupings from '../groupings'

export function daily(array: Data[]) {
  const daily = groupings.daily(array).map(item => ({
    ...ratings.oxygens(item.data),
    ...item,
  }))
  const average = utils.average(daily.map(d => +d.average))
  const min = Math.min(...daily.map(d => d.min))
  const max = Math.max(...daily.map(d => d.max))

  return {
    average,
    daily,
    min: Math.abs(min) === Infinity ? 0 : min,
    max: Math.abs(max) === Infinity ? 0 : max,
  }
}

export function day(date: number, array: Data[]) {
  const group = groupings.day(date, array)
  const grade = ratings.oxygens(group.data)
  const hours = groupings
    .hours(group.data, 1800)
    .map(item => ({
      ...ratings.oxygens(item.data),
      ...item,
    }))
  return { ...group, ...grade, hours }
}

export function week(date: number, array: Data[]) {
  const data = groupings.week(date, array)
  return { ...daily(data), data }
}

export function month(date: number, array: Data[]) {
  const data = groupings.month(date, array)
  return { ...daily(data), data }
}
