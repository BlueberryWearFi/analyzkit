import * as utils from './utils'
import * as computes from './computes'
import * as groupings from './groupings'
import { Data, Step } from './types'

export function sleeps(data: Data[]) {
  const durations = {
    dep: data.filter(d => d.value === 1).length * 60,
    lig: data.filter(d => d.value === 2).length * 60,
    rem: data.filter(d => d.value === 3).length * 60,
    act: data.filter(d => d.value <= 3).length * 60,
    tol: data.length * 60,
  }

  const standard = 28800
  const percents = {
    dep: utils.percentage(standard, durations.dep, 0),
    lig: utils.percentage(standard, durations.lig, 0),
    rem: utils.percentage(standard, durations.rem, 0),
  }

  const scores = {
    lig: computes.sleep.light(durations.lig),
    dep: computes.sleep.deeps(durations.dep),
    dur: computes.sleep.duration(durations.act),
  }
  const score = +utils.average([scores.dep, scores.dur, scores.lig]).toFixed(0)

  const evals = {
    com: utils.riposte(
      [score > 85, 'high' as const],
      [score > 60, 'normal' as const],
      [score > 0, 'low' as const],
    )!,
    dep: utils.riposte(
      [percents.dep > 20 && percents.dep < 40, 'normal' as const],
      [percents.dep < 20, 'low' as const],
      [percents.dep > 40, 'high' as const],
    )!,
    lig: utils.riposte(
      [percents.lig > 60 && percents.lig < 80, 'normal' as const],
      [percents.lig < 60, 'low' as const],
      [percents.lig > 80, 'high' as const],
    )!,
    rem: utils.riposte(
      [percents.rem > 10 && percents.rem < 30, 'normal' as const],
      [percents.rem < 10, 'low' as const],
      [percents.rem > 30, 'high' as const],
    )!,
  }

  return {
    durations,
    percents,
    scores,
    score,
    evals,
  }
}

export function steps(data: Step[], target = 10000) {
  const { kcal, km, total } = composition(data)
  const score = utils.percentage(target, total, 0)
  const evaluate = utils.riposte(
    [score > 90, 'high' as const],
    [score < 50, 'low' as const],
    [true, 'lack' as const],
  )!
  const hours = groupings.hours(data)
    .map(hour => ({
      ...composition(hour.data),
      ...hour,
    }))

  function composition(data: Step[]) {
    const kcal = +utils.plus(data.map(d => d.kcal)) / 100
    const km = +utils.plus(data.map(d => d.km)) / 100
    const total = data.map(d => d.value).reduce((a, b) => a + b, 0)
    return { kcal: kcal.toFixed(2), km: km.toFixed(2), total }
  }
  return {
    eval: evaluate,
    kcal,
    km,
    total,
    score,
    hours,
  }
}

export function oxygens(data: Data[]) {
  data = data.filter(d => !!d.value)
  const { average, min, max } = composition(data)
  const score = average >= 95
    ? 100
    : average >= 80 ? 60 : 20

  const evaluate = utils.riposte(
    [average >= 95, 'normal' as const],
    [average >= 80, 'abnormal' as const],
    [true, 'danger' as const],
  )!

  const hours = groupings.hours(data)
    .map(hour => ({
      ...composition(hour.data),
      ...hour,
    }))

  function composition(data: Data[]) {
    const average = utils.average(data.map(d => d.value))
    const min = Math.min(...data.map(d => d.value))
    const max = Math.max(...data.map(d => d.value))
    return {
      average: +average.toFixed(2),
      min: Math.abs(min) === Infinity ? 0 : min,
      max: Math.abs(max) === Infinity ? 0 : max,
    }
  }

  return {
    score: data.length ? score : 0,
    hours,
    eval: evaluate,
    average,
    min,
    max,
  }
}

export function rates(data: Data[]) {
  const { average, min, max } = composition(data)
  const score = data.length ? 100 : 0
  const evaluate = average > 25 && average < 200
    ? 'normal'
    : 'abnormal'

  const hours = groupings.hours(data, 1800)
    .map(hour => ({
      ...composition(hour.data),
      ...hour,
    }))

  function composition(data: Data[]) {
    const average = utils.average(data.map(d => d.value))
    const min = Math.min(...data.map(d => d.value))
    const max = Math.max(...data.map(d => d.value))
    return {
      average: +average.toFixed(0),
      min: Math.abs(min) === Infinity ? 0 : min,
      max: Math.abs(max) === Infinity ? 0 : max,
    }
  }

  return {
    eval: evaluate as 'normal' | 'abnormal',
    average,
    hours,
    min,
    max,
    score,
  }
}
