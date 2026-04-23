export function getItemImageSrc(item) {
  const image = item?.primaryImage || item?.images?.[0] || item?.itemImage1
  if (!image) return null
  if (image.startsWith("data:") || image.startsWith("http://") || image.startsWith("https://")) return image
  return `data:image/*;base64,${image}`
}

export function isItemAvailable(item) {
  if (typeof item?.availability === "string") {
    return item.availability.toLowerCase() === "available"
  }
  return Boolean(item?.available ?? item?.avail)
}

export function todayString() {
  return new Date().toISOString().split("T")[0]
}

export function tomorrowString() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split("T")[0]
}
