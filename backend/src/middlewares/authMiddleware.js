import pool from "../config/db.js";
import { verifyToken } from "../utils/jwt.js";

export const protectAuth = async (req,res,next) =>{
    try{
        const token = req.cookies?.token;

        if(!token){
            return res.status(401).json({
                "message":"Not authorized / No token provided"
            })
        }

        const decoded = verifyToken(token);
        const result = await pool.query(
            'select id,username,email,created_at from users where id = $1',
            [decoded.id]
        );
        if(result.rows.length===0){
            return res.status(401).json({
                "message":"User belonging to this token no longer exists!"
            })
        }

        req.user = result.rows[0];
        next();
    }
    catch(err){
        return res.status(401).json({
            "message":"Not authorized / Token Expired",
            "error": err.message
        })
    }
}
