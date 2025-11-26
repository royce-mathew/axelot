import { formatDistanceToNow } from "date-fns"
import { Timestamp } from "firebase/firestore"
import * as Y from "yjs"

export function timeAgo(timestamp: any) {
  try {
    // If the value is a plain object with Firestore timestamp fields, convert it
    if (
      !(timestamp instanceof Timestamp) &&
      typeof timestamp === "object" &&
      timestamp !== null &&
      "_seconds" in timestamp &&
      "_nanoseconds" in timestamp
    ) {
      timestamp = new Timestamp(timestamp._seconds, timestamp._nanoseconds)
    }

    return formatDistanceToNow(timestamp.toDate(), { addSuffix: true })
  } catch (err) {
    return "Never"
  }
}

export function extractPreview(content: any): string {
  if (!content) return ""

  try {
    const update = content.toUint8Array ? content.toUint8Array() : content
    const ydoc = new Y.Doc()
    Y.applyUpdate(ydoc, update)

    const fragment = ydoc.getXmlFragment("default")
    const xmlString = fragment.toString()
    const plainText = xmlString.replace(/<[^>]+>/g, " ")
    return plainText.replace(/\s+/g, " ").trim().slice(0, 300)
  } catch (e) {
    return ""
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

export function hslToHex(h: number, s: number, l: number): string {
  // Normalize s and l to 0-1 range
  s /= 100
  l /= 100

  let r, g, b

  if (s === 0) {
    // Achromatic (gray)
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q

    // Normalize h to 0-1 range
    r = hue2rgb(p, q, h / 360 + 1 / 3)
    g = hue2rgb(p, q, h / 360)
    b = hue2rgb(p, q, h / 360 - 1 / 3)
  }

  // Convert 0-1 RGB values to 0-255 and format as hex
  const toHex = (c: number): string => {
    const hex = Math.round(c * 255).toString(16)
    return hex.length === 1 ? "0" + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function stringToHslColor(str: string): string {
  let hash = 0
  // A simple, fast additive hash (similar to a variation of DJB2)
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash) // Simple hash calculation: c + ((hash << 5) - hash) is equivalent to hash * 31 + c
    hash |= 0 // Ensure the number remains a 32-bit signed integer for consistency
  }

  const h = Math.abs(hash) % 360 // Map the hash to the Hue (0-360)
  const s = 70 // Saturation: 70%
  const l = 55 // Lightness: 55%
  return hslToHex(h, s, l)
}
