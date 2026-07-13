/** Format Date */
export const getFormattedDate = (date) =>
  date
    ? new Date(date).toLocaleDateString('en-us', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : ''

/** Check if an Image Path is Relative or Absolute */
export const checkImageUrl = (image, url) => {
  try {
    new URL(image)
    return image
  } catch (_error) {
    return new URL(image, url).toString()
  }
}
