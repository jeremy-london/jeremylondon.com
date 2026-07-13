import getReadingTime from 'reading-time'

export const getReadingTimeDetails = (content = '') => {
  const readingTime = getReadingTime(content)
  const readingTimeMinutes = Math.max(3, Math.ceil(readingTime.minutes))

  return {
    minutesRead: readingTime.text,
    readingTimeMinutes,
  }
}
