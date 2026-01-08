// src/repositories/userRepository.js
import prisma from "../clients/prismaClient.js";

/**
 * Create user profile row
 */
export async function createUserProfile(data) {
  return prisma.users.create({
    data,
  });
}

/**
 * Get active (not deleted) user profile
 */
export async function getActiveUserById(userId) {
  return prisma.users.findFirst({
    where: {
      id: userId,       // ✅ use argument, not req.user.id
      deleted: false,
    },
  });
}

/**
 * Soft delete user profile
 */
export async function softDeleteUserById(userId) {
  if (!userId) throw new Error("softDeleteUserById: missing userId");

  try {
    const result = await prisma.users.updateMany({
      where: { id: userId, deleted: false },
      data: { deleted: true },
    });

    if (result.count === 0) {
      console.warn(`[softDeleteUserById] No user deleted (already deleted or not found):`, userId);
      return null;
    }

    console.log(`[softDeleteUserById] Soft deleted user:`, userId);
    return true;
  } catch (err) {
    console.error(`[softDeleteUserById] Error deleting user ${userId}:`, err);
    throw err;
  }
}