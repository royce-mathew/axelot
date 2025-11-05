import { formatDistanceToNow } from "date-fns"
import { Timestamp } from "firebase/firestore"

export function timeAgo(timestamp: Timestamp) {
  try {
    return formatDistanceToNow(timestamp.toDate(), { addSuffix: true })
  } catch {
    return "Never"
  }
}

export function getInitials(name?: string | null) {
  if (!name) return "??"
  const names = name.split(" ")
  let initials = names[0].substring(0, 1).toUpperCase()

  if (names.length > 1) {
    initials += names[names.length - 1].substring(0, 1).toUpperCase()
  }
  return initials
}
