import pool from '../config/db.js';
import { hashPassword, comparePassword} from '../utils/hashPassword.js';
import { generateToken } from '../utils/jwt.js';
async function signup(req,res){
    try{
        const { username, email, password } = req.body;
        if(!username || !email || !password){
            return res.status(400).json({
                "message":"Please fill out all the user details!"
            })
        }
        const existingUser = await pool.query('select id from users where email = $1',[email]);

        if(existingUser.rows.length>0){
            return res.status(409).json({
                "message":"The user already exists!"
            })
        }
        const hashedPassword = await hashPassword(password);

        const newUser = await pool.query(
            `INSERT INTO users (username,email,password) values ($1,$2,$3) RETURNING id,username,email,created_at`,[username,email,hashedPassword]
        )

        const user = newUser.rows[0];

        const token = generateToken({id: user.id});

        res.cookie("token",token,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === "production"
            ? "none"
            : "lax",
            maxAge: 24 * 60 * 60 * 1000 
        })

        res.status(201).json({ message: 'User successfully signed up!', user });
    } catch(err){
        res.status(500).json({
            'message':'Server Error'
        })
    }
}

async function login(req,res){
    try{
        const {email,password} = req.body;

        if(!email || !password){
            return res.status(400).json({
                "message":"Invalid Credentials"
            })
        }
        const existingUser = await pool.query(
            `SELECT id,username,email,password from users where email=$1`,[email]
        )

        if(existingUser.rows.length==0){
            return res.status(404).json({
                "message":"User not found!"
            })
        }
        const user = existingUser.rows[0];

        const isPasswordMatching = await comparePassword(password,user.password);

        if(!isPasswordMatching){
            return res.status(401).json({
                "message":"Invalid Credentials"
            })
        }
        const token = generateToken({id: user.id});

        res.cookie("token",token,{
            httpOnly: true,
            secure: process.env.NODE_ENV==='production',
            sameSite: process.env.NODE_ENV === "production"
            ? "none"
            : "lax",
            maxAge: 24 * 60 * 60 * 1000             
        })
        res.status(200).json({ 'message': 'Login Successful!',
            user:{
                "id": user.id,
                "username": user.username,
                "email": user.email
            } });
    } catch(err){
        res.status(500).json({
            'message':'Server Error'
        })
    }
}
async function getUser(req,res){
    return res.status(200).json({
        user : req.user,
    })
}
export default { login ,signup ,getUser };