// src/services/categorieService.js
import {
  createCategory as repoCreateCategory,
  getCategoriesByUserId,
  deleteCategory as repoDeleteCategory,
} from "../repositories/financeRepository.js";

export const getCategories = async (userId) => {
  return await getCategoriesByUserId(userId);
};

export const createCategory = async (userId, name, color) => {
  return await repoCreateCategory(userId, name, color);
};

export const deleteCategory = async (userId, categoryId) => {
  return await repoDeleteCategory(categoryId);
};
