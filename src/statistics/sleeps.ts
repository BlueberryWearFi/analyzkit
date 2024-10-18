import dayjs from 'dayjs'
import { Data } from '../types'
import * as utils from '../utils'
import * as ratings from '../ratings'
import * as groupings from '../groupings'
import * as computes from '../computes'

export function daily(array: Data[]) {
  const daily = groupings.diffs(array).map(item => ({
    ...ratings.sleeps(item.data),
    ...item,
  }))

  const duration = +utils.average(daily.map(item => item.durations.tol)).toFixed(0)
  const score = +utils.average(daily.map(item => item.score)).toFixed(0)
  const evaluate = utils.riposte(
    [score > 85, 'high' as const],
    [score > 60, 'normal' as const],
    [score > 0, 'low' as const],
  )
  const datesBySleep = daily.map(item => item.data[0]?.date).filter(Boolean)
  const datesByWakes = daily.map(item => item.data.at(-1)?.date as number).filter(Boolean)

  const earliestWakes = utd(datesByWakes).sort((a, b) => a - b)[0]
  const earliestSleep = utd(datesBySleep).sort((a, b) => a - b)[0]

  const atlatestWakes = utd(datesByWakes).sort((a, b) => a - b).at(-1)
  const atlatestSleep = utd(datesBySleep).sort((a, b) => a - b).at(-1)

  const times = {
    average: {
      sleep: computes.sleep.average('00:00', datesBySleep),
      wakes: computes.sleep.average('08:00', datesByWakes),
    },
    earliest: {
      wakes: earliestWakes ? dayjs.duration(earliestWakes, 'seconds').format('HH:mm') : undefined,
      sleep: earliestSleep ? dayjs.duration(earliestSleep, 'seconds').format('HH:mm') : undefined,
    },
    atlatest: {
      wakes: atlatestWakes ? dayjs.duration(atlatestWakes, 'seconds').format('HH:mm') : undefined,
      sleep: atlatestSleep ? dayjs.duration(atlatestSleep, 'seconds').format('HH:mm') : undefined,
    },
  }

  return {
    eval: evaluate,
    score,
    daily,
    duration,
    times,
  }
}

function utd(dates: number[]) {
  return dates.map((date) => {
    const [hr, min] = dayjs.unix(date).format('HH:mm').split(':').map(Number)
    return dayjs.duration({ hours: hr, minutes: min }).asSeconds()
  }).sort((a, b) => a - b)
}

export function day(date: number, array: Data[]) {
  const group = groupings.diff(date, array)
  const grade = ratings.sleeps(group.data)
  return { ...group, ...grade }
}

export function week(date: number, array: Data[]) {
  const data = groupings.week(date, array, { difference: -43200 })
  return { ...daily(data), data }
}

export function month(date: number, array: Data[]) {
  const data = groupings.month(date, array, { difference: -43200 })
  return { ...daily(data), data }
}
