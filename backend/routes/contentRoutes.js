import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getContent,
  getExperience,
  updateContent,
  getSocialLinks,
  updateSocialLinks,
} from "../controllers/contentController.js";

const router = express.Router();

router.get("/experience", getExperience);

router.get("/", getContent);

router.put("/", protect, updateContent);

router.get("/social-links", getSocialLinks);

router.put("/social-links", protect, updateSocialLinks);

export default router;
