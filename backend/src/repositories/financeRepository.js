// src/repositories/financeRepository.js
import prisma from "../clients/prismaClient.js";

export async function createCategory(userId, name, color) {
  return await prisma.finance_categories.create({
    data: {
      user_id: userId,
      name: name,
      color: color || "#cccccc",
    },
  });
}

export async function getCategoriesByUserId(userId) {
  return await prisma.finance_categories.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "asc" },
  });
}

export async function deleteCategory(categoryId) {
  return await prisma.finance_categories.delete({
    where: { id: categoryId },
  });
}
