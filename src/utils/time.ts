import dayjs from 'dayjs'

export function getTimePoints(difference: number) {
  const timePointsArray: string[] = []
  const startOfDay = dayjs().startOf('day')
  const endOfDay = dayjs().endOf('day')
  let currentTime = startOfDay
  while (currentTime.isBefore(endOfDay) || currentTime.isSame(endOfDay, 'minute')) {
    timePointsArray.push(currentTime.format('HH:mm'))
    currentTime = currentTime.add(difference, 'second')
  }
  return timePointsArray
}
