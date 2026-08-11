import e from "express";
import { protectAuth } from "../../middlewares/authMiddleware.js";
import dishController from "../controllers/dish.controller.js";

const router = e.Router();

router.post("/saved",protectAuth,dishController.saveDish);
router.post("/log",protectAuth,dishController.logDish);
router.get("/saved",protectAuth,dishController.getSavedDishes);
router.delete("/saved/:id",protectAuth,dishController.deleteSavedDish);

export default router;