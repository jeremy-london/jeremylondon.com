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
  if (URL.canParse(image)) return image
  return new URL(image, url).toString()
}
