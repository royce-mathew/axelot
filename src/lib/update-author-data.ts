import { getDoc, updateDoc } from "firebase/firestore"
import { documentRef } from "@/lib/converters/document"
import { userRef } from "@/lib/converters/user"

/**
 * Syncs authorNames array with current owner and writeAccess users
 * This should be called when writeAccess is modified or when user names change
 */
export async function syncAuthorNames(
  storyId: string,
  ownerId: string,
  writeAccessUserIds: string[]
) {
  try {
    // Collect all user IDs that should be authors (owner + writeAccess)
    const allAuthorIds = [ownerId, ...writeAccessUserIds]
    const uniqueAuthorIds = [...new Set(allAuthorIds)] // Remove duplicates

    // Fetch all author names in parallel
    const authorNamePromises = uniqueAuthorIds.map(async (userId) => {
      const userDocRef = userRef(userId)
      const userSnap = await getDoc(userDocRef)
      return userSnap.exists() ? userSnap.data().name : null
    })

    const authorNamesResults = await Promise.all(authorNamePromises)

    // Filter out null values (users that don't exist or have no name)
    const authorNames = authorNamesResults.filter(
      (name): name is string => name != null
    )

    // Update the story document
    const storyRef = documentRef(storyId)
    await updateDoc(storyRef, {
      authorNames,
    })

    console.log(
      `Synced ${authorNames.length} author names for story ${storyId}`
    )
  } catch (error) {
    console.error("Error syncing author names:", error)
    throw error
  }
}
