import e from "express";
import {protectAuth} from '../middlewares/authMiddleware.js';
import statController from "../controllers/statController.js";
const router = e.Router();
router.get('/daily',protectAuth,statController.getStatsByDate);
router.get('/monthly',protectAuth,statController.getMonthlySummary);
export default router;