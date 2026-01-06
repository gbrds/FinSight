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
  return prisma.users.update({
    where: { id: userId },   // ✅ use argument
    data: { deleted: true },
  });
}