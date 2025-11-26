/**
 * Generates a deterministic gradient background based on a story ID
 * Used for stories without cover images
 */

const gradients = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
  "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
  "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  "linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)",
  "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
  "linear-gradient(135deg, #f77062 0%, #fe5196 100%)",
  "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
  "linear-gradient(135deg, #e45a84 0%, #f5a962 100%)",
  "linear-gradient(135deg, #96fbc4 0%, #f9f586 100%)",
]

/**
 * Simple hash function to convert string to number
 */
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

/**
 * Generate a gradient CSS string for a given story ID
 * Returns the same gradient for the same ID (deterministic)
 */
export function generateGradient(storyId: string): string {
  const hash = hashCode(storyId)
  const index = hash % gradients.length
  return gradients[index]
}

/**
 * Get inline style object for gradient background
 */
export function getGradientStyle(storyId: string) {
  return {
    background: generateGradient(storyId),
  }
}
