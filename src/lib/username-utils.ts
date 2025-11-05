import { getDocs, query, where } from 'firebase/firestore';
import { usersCollectionRef } from '@/lib/converters/user';

// In-memory cache for username to ID mappings (persists during session)
const usernameCache = new Map<string, string | null>();

// Cache TTL (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;
const cacheTimestamps = new Map<string, number>();

/**
 * Validates username format
 * - 3-20 characters
 * - Alphanumeric, underscores, and hyphens only
 * - Must start with a letter or number
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9][a-zA-Z0-9_-]{2,19}$/;
  return usernameRegex.test(username);
}

/**
 * Checks if username is a Firebase ID format (28 chars, alphanumeric)
 */
export function isFirebaseId(id: string): boolean {
  return id.length === 28 && /^[a-zA-Z0-9]+$/.test(id);
}

/**
 * Checks if the parameter is a username (starts with @)
 */
export function isUsernameParam(param: string): boolean {
  return param.startsWith('@');
}

/**
 * Strips the @ prefix from a username parameter
 */
export function stripUsernamePrefix(param: string): string {
  return param.startsWith('@') ? param.slice(1) : param;
}

/**
 * Checks if a username is available (not taken)
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  try {
    const q = query(
      usersCollectionRef(),
      where('username', '==', username.toLowerCase())
    );
    const snapshot = await getDocs(q);
    return snapshot.empty;
  } catch (error) {
    console.error('Error checking username availability:', error);
    return false;
  }
}

/**
 * Gets user ID by username (with caching)
 */
export async function getUserIdByUsername(username: string, skipCache = false): Promise<string | null> {
  const lowerUsername = username.toLowerCase();
  console.log('[getUserIdByUsername] Looking up username:', lowerUsername, 'skipCache:', skipCache);
  
  // Check cache first (unless skipCache is true)
  const now = Date.now();
  const cachedTimestamp = cacheTimestamps.get(lowerUsername);
  
  if (!skipCache && cachedTimestamp && (now - cachedTimestamp) < CACHE_TTL) {
    const cached = usernameCache.get(lowerUsername);
    if (cached !== undefined) {
      console.log('[getUserIdByUsername] Cache hit:', cached);
      return cached;
    }
  }
  
  // Not in cache or expired, fetch from Firestore
  console.log('[getUserIdByUsername] Cache miss, querying Firestore...');
  try {
    const collectionRef = usersCollectionRef();
    console.log('[getUserIdByUsername] Collection path:', collectionRef.path);
    
    const q = query(
      collectionRef,
      where('username', '==', lowerUsername)
    );
    
    console.log('[getUserIdByUsername] Executing query for username:', lowerUsername);
    const snapshot = await getDocs(q);
    
    console.log('[getUserIdByUsername] Query result - empty?', snapshot.empty, 'docs:', snapshot.docs.length);
    
    if (!snapshot.empty) {
      snapshot.docs.forEach((doc) => {
        console.log('[getUserIdByUsername] Found doc:', doc.id, 'data:', doc.data());
      });
    }
    
    if (snapshot.empty) {
      // Cache the negative result too
      usernameCache.set(lowerUsername, null);
      cacheTimestamps.set(lowerUsername, now);
      return null;
    }
    
    const userId = snapshot.docs[0].id;
    console.log('[getUserIdByUsername] Found user ID:', userId);
    
    // Cache the result
    usernameCache.set(lowerUsername, userId);
    cacheTimestamps.set(lowerUsername, now);
    
    return userId;
  } catch (error) {
    console.error('Error getting user by username:', error);
    return null;
  }
}

/**
 * Generates a suggested username from a name
 */
export function generateUsernameFromName(name: string): string {
  // Remove special characters and spaces, convert to lowercase
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 15);
  
  // Add random numbers if too short
  if (cleaned.length < 3) {
    return `user${Math.floor(Math.random() * 10000)}`;
  }
  
  return cleaned;
}

/**
 * Generates a unique username by appending numbers if needed
 */
export async function generateUniqueUsername(baseName: string): Promise<string> {
  let username = generateUsernameFromName(baseName);
  let isAvailable = await isUsernameAvailable(username);
  
  let counter = 1;
  while (!isAvailable && counter < 1000) {
    username = `${generateUsernameFromName(baseName)}${counter}`;
    isAvailable = await isUsernameAvailable(username);
    counter++;
  }
  
  return username;
}

/**
 * Reserved usernames that cannot be used
 */
const RESERVED_USERNAMES = [
  'admin',
  'api',
  'auth',
  'dashboard',
  'documents',
  'search',
  'stories',
  'settings',
  'profile',
  'user',
  'users',
  'help',
  'support',
  'about',
  'terms',
  'privacy',
  'blog',
  'careers',
  'contact',
];

export function isReservedUsername(username: string): boolean {
  return RESERVED_USERNAMES.includes(username.toLowerCase());
}
