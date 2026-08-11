import e from "express";
import userController from "../controllers/userController.js";
import { protectAuth } from "../middlewares/authMiddleware.js";

const router = e.Router();

router.post('/details',protectAuth,userController.postUserDetails);
router.get('/details',protectAuth,userController.getUserDetails);

export default router;
