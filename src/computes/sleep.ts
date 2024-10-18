import dayjs from 'dayjs'
import duration_ from 'dayjs/plugin/duration'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)
dayjs.extend(duration_)

export function duration(seconds: number) {
  if (!seconds)
    return 0
  // 将睡眠时间从秒转换为小时
  const sleepTimeInHours = seconds / 3600

  // 建议睡眠时间为 8 小时
  const recommendedSleepTime = 8

  // 计算睡眠时间与建议睡眠时间的差值
  const timeDifference = Math.abs(sleepTimeInHours - recommendedSleepTime)

  // 根据差值确定评分的减分情况
  let score = 100 - (timeDifference * 10) // 每小时差距扣除 10 分

  // 分数不能低于 0 分
  score = Math.max(score, 0)

  return score
}

export function deeps(seconds: number) {
  const min = 5760
  const max = 11520
  const poi = 10

  let score = 100

  if (seconds >= min && seconds <= max)
    return score

  if (seconds < min) {
    const difference = ((min - seconds) / min) * 100
    score -= Math.ceil(difference / 10) * poi
  }
  else if (seconds > max) {
    const difference = ((seconds - max) / max) * 100
    score -= Math.ceil(difference / 10) * poi
  }
  return score < 0 ? 0 : score
}

export function light(seconds: number) {
  const min = 17280
  const max = 23040
  const poi = 10

  let score = 100

  if (seconds >= min && seconds <= max)
    return score

  if (seconds < min) {
    const difference = ((min - seconds) / min) * 100
    score -= Math.ceil(difference / 10) * poi
  }
  else if (seconds > max) {
    const difference = ((seconds - max) / max) * 100
    score -= Math.ceil(difference / 10) * poi
  }
  return score < 0 ? 0 : score
}

export function average(base: string, dates: (number | undefined)[]): string {
  const durations = dates
    .map(date => date || 0)
    .map(date => dayjs.unix(date).format('HH:mm'))
    .map(hour => hour.split(':').map(Number))
    .map(time => dayjs.duration({ hours: time[0], minutes: time[1] }))
    .map(duration => duration.format('HH:mm'))

  const baseTime = dayjs(base, 'HH:mm')

  // Convert times to minutes relative to baseTime
  const minutes = durations.map((time) => {
    const currentTime = dayjs(time, 'HH:mm')
    let diff = currentTime.diff(baseTime, 'minute')
    // Adjust for times that are after noon
    if (diff < -12 * 60)
      diff += 24 * 60
    // Adjust for times that are before noon
    if (diff > 12 * 60)
      diff -= 24 * 60
    return diff
  })

  // Calculate average in minutes
  const averageMinutes = minutes.reduce((sum, min) => sum + min, 0) / durations.length
  // Convert back to time format
  return baseTime.add(averageMinutes, 'minute').format('HH:mm')
}
