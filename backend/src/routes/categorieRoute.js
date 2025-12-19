// routes/categorieRoute.js
import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  getCategories,
  createCategory,
  deleteCategory,
} from "../services/categorieService.js";

const router = express.Router();

// GET /api/finance/categories
router.get("/", authMiddleware, async (req, res) => {
  try {
    const categories = await getCategories(req.user.id, req.user.token);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/finance/categories
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name) return res.status(400).json({ error: "Category name required" });

    const category = await createCategory(req.user.id, req.user.token, name, color);
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/finance/categories/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const categoryId = req.params.id;
    await deleteCategory(req.user.id, req.user.token, categoryId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;