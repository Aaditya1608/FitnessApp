import pool from '../config/db.js';
import { calculateTargetCalories } from '../utils/calculateCalories.js'
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';

async function postUserDetails(req, res) { //right after auth
    try {
        const { weight, height, age, sex, lifestyle, goal } = req.body;
        const userId = req.user.id;
        if (!weight || !height || !age || !sex || !goal || !lifestyle) {
            return ApiError(res,400,"Please provide all the physical information!")
        }

        const validGoals = ['weight_loss', 'weight_gain'];
        const validSexes = ['male', 'female', 'other'];
        const validLifestyles = [
            'sedentary',
            'lightly_active',
            'moderately_active',
            'highly_active',
            'extra_active',
        ];
        if (!validGoals.includes(goal)) {
            return ApiError(res,400,"Invalid Goal")
        }

        if (!validSexes.includes(sex)) {
            return ApiError(res,400,"Invalid Sex")
        }

        if (!validLifestyles.includes(lifestyle)) {
            return ApiError(res,400,"Invalid Lifestyle")
        }
        const targetCalories = calculateTargetCalories({weight, height, age, sex, lifestyle, goal});

        const query = `
            INSERT INTO user_details (user_id, weight, height, age, sex, lifestyle, goal, target_calories, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id) 
            DO UPDATE SET
                weight = EXCLUDED.weight,
                height = EXCLUDED.height,
                age = EXCLUDED.age,
                sex = EXCLUDED.sex,
                lifestyle = EXCLUDED.lifestyle,
                goal = EXCLUDED.goal,
                target_calories = EXCLUDED.target_calories,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *;
        `;

        const result = await pool.query(query,[userId,weight,height,age,sex,lifestyle,goal,targetCalories]);
        return ApiResponse(res,200,'User details saved successfully!',result.rows[0])
    }
    catch (err) {
        return ApiError(res,500,err);
    }
}
async function getUserDetails(req,res){ //settings page
    try{
        const userId = req.user.id;
        const query = `SELECT * from user_details where user_id=$1`;

        const details = await pool.query(query,[userId]);

        return ApiResponse(res,200,"Successfully retrieved the user details!",details.rows[0])
    } catch(err){
        return ApiError(res,500,err);
    }
}
export default { postUserDetails,getUserDetails };

