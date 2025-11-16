import { UserProfile } from '../types/user.js';
import * as db from '../db/database.js';

export async function createUser(user: UserProfile): Promise<UserProfile> {
  await db.saveUser(user);
  return user;
}

export async function getUserById(userId: string): Promise<UserProfile | null> {
  return db.getUser(userId);
}

export async function updateUserAccessibility(
  userId: string,
  accessibility: Partial<UserProfile['accessibility']>
): Promise<void> {
  return db.updateUserAccessibility(userId, accessibility);
}

