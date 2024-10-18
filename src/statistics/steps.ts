import dayjs from 'dayjs'
import { Step } from '../types'
import * as utils from '../utils'
import * as ratings from '../ratings'
import * as groupings from '../groupings'

const store = { target: 10000 }

export function setup(target: number) {
  store.target = target
}

export function daily(array: Step[], target = store.target) {
  const daily = groupings.daily(array).map(item => ({
    ...ratings.steps(item.data, target),
    ...item,
  }))

  const avers = {
    step: utils.average(daily.map(d => d.total)),
    kcal: utils.average(daily.map(d => +d.kcal)).toFixed(2),
    km: utils.average(daily.map(d => +d.km)).toFixed(2),
  }

  return {
    avers,
    daily,
  }
}

export function day(date: number, array: Step[], target = store.target) {
  const group = groupings.day(date, array)
  const grade = ratings.steps(group.data, target)
  const hours = groupings
    .hours(group.data, 1800)
    .map((item) => {
      const grade = ratings.steps(item.data)
      return ({
        total: grade.total,
        kcal: grade.kcal,
        km: grade.km,
        ...item,
      })
    })
  return { ...group, ...grade, hours }
}

export function week(date: number, array: Step[], target = store.target) {
  const data = groupings.week(date, array)
  const weekTarget = decreasePercent(target * 7, 0.10)
  const grade = ratings.steps(data, weekTarget)
  return { ...daily(data, target), data, ...grade }
}

export function month(date: number, array: Step[], target = store.target) {
  const data = groupings.month(date, array)
  const days = dayjs.unix(date).daysInMonth()
  const monthTarget = decreasePercent(target * days, 0.20)
  const grade = ratings.steps(data, monthTarget)
  return { ...daily(data, target), data, ...grade }
}

function decreasePercent(value: number, percent: number) {
  return value - (value * percent)
}
