import e from "express";
import authController from "../controllers/authController.js";
import { protectAuth } from "../middlewares/authMiddleware.js";
const router = e.Router();

router.post("/login",authController.login);
router.post('/signup',authController.signup);
router.post('/logout',(req,res)=>{
    res.clearCookie('token',{
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none':'lax',
    });
    return res.status(200).json({
        "message": "User logged out successfully"
    })
})
router.get('/me',protectAuth,authController.getUser)

export default router;