import e from "express";
import { protectAuth } from "../../middlewares/authMiddleware.js";
import aiController from "../controllers/ai.controller.js";

const router = e.Router();

router.post("/generate",protectAuth,aiController.generateDishes);
router.post("/post-dish",protectAuth,aiController.postCustomRecipe);
export default router;