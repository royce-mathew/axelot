import { clsx, type ClassValue } from "clsx"
import { formatDistanceToNow } from "date-fns"
import { Timestamp } from "firebase/firestore"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeAgo(timestamp: Timestamp) {
  try {
    return formatDistanceToNow(timestamp.toDate(), { addSuffix: true })
  } catch (e) {
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
