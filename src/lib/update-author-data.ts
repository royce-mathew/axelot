import { getDocs, query, where, writeBatch, WriteBatch } from 'firebase/firestore';
import { allDocumentsRef } from '@/lib/converters/document';
import { db } from '@/lib/firebase/client';

/**
 * Updates denormalized author data across all stories when user profile changes
 * This should be called when user updates their profile (name, username, or image)
 */
export async function updateAuthorDataInStories(
  userId: string,
  updates: {
    name?: string | null;
    username?: string | null;
    image?: string | null;
  }
) {
  try {
    // Query all stories owned by this user
    const storiesQuery = query(
      allDocumentsRef(),
      where('owner', '==', userId)
    );
    
    const snapshot = await getDocs(storiesQuery);
    
    if (snapshot.empty) {
      console.log('No stories found for user:', userId);
      return;
    }

    // Firestore batches can only handle 500 operations
    const batchSize = 500;
    const batches: WriteBatch[] = [];
    let currentBatch = writeBatch(db);
    let operationCount = 0;

    snapshot.docs.forEach((doc) => {
      const updateData: Record<string, string | null> = {};
      
      if (updates.name !== undefined) {
        updateData.ownerName = updates.name || null;
      }
      if (updates.username !== undefined) {
        updateData.ownerUsername = updates.username || null;
      }
      if (updates.image !== undefined) {
        updateData.ownerImage = updates.image || null;
      }

      currentBatch.update(doc.ref, updateData);
      operationCount++;

      // If we've reached the batch size, start a new batch
      if (operationCount === batchSize) {
        batches.push(currentBatch);
        currentBatch = writeBatch(db);
        operationCount = 0;
      }
    });

    // Add the last batch if it has operations
    if (operationCount > 0) {
      batches.push(currentBatch);
    }

    // Commit all batches
    await Promise.all(batches.map(batch => batch.commit()));

    console.log(`Updated author data in ${snapshot.docs.length} stories`);
  } catch (error) {
    console.error('Error updating author data in stories:', error);
    throw error;
  }
}
