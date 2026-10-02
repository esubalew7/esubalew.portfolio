import express from "express";
import { getExperience } from "../controllers/contentController.js";

const router = express.Router();

/**
 * @route   GET /api/experience
 * @desc    Get published experience categories, items, and certificates (public).
 *          If authenticated admin, returns all items including unpublished.
 * @access  Public / Admin
 */
router.get("/", getExperience);

export default router;
