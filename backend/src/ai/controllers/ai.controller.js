import ApiError from "../../utils/apiError.js";
import pool from "../../config/db.js";
import { generateRecipesWithAI } from "../services/aiGenerateDishes.js";
import { analyzeCustomRecipeWithAI } from "../services/aiPostCustomDishes.js"
import ApiResponse from "../../utils/apiResponse.js";

async function generateDishes(req, res) {
    try {
        const { ingredients } = req.body;
        const userId = req.user.id;
        if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
            return ApiError(res, 400, "Please provide an array of available ingredients!");
        }
        const userDetailsResult = await pool.query(
            'SELECT weight, height, age, sex, lifestyle, goal, target_calories FROM user_details WHERE user_id = $1',
            [userId]
        );
        if (userDetailsResult.rows.length === 0) {
            return ApiError(res, 400, "Please complete your user details profile first!");
        }
        const userDetails = userDetailsResult.rows[0];

        const dishes = await generateRecipesWithAI({
            ingredients,
            userDetails
        });
        return ApiResponse(res, 200, "Recipes generated Successfully!", dishes);

    } catch (err) {
        console.log(err);
        return ApiError(res, 500, "Server Error", err);
    }
}

async function postCustomRecipe(req, res) {
    try {
        const { title, ingredients, recipe } = req.body;

        const userId = req.user.id;

        // Validation
        if (!ingredients || typeof ingredients !== 'object' || Object.keys(ingredients).length === 0) {
            return ApiError(res,400,'Please provide ingredients as a key-value object (e.g., { "Chicken Breast": "200g" }).')
        }

        if (!recipe || !Array.isArray(recipe) || recipe.length === 0) {
            return ApiError(res,400,'Please provide recipe instructions as an array of step strings.')
        }
        const analyzedDish = await analyzeCustomRecipeWithAI({
            title: title || 'My Custom Dish',
            ingredients,
            recipeSteps: recipe,
        });

        const query = `
            INSERT INTO custom_dishes(user_id, title, serving_size, recipe, ingredients, macros,prep_time)
            VALUES ($1, $2, $3, $4, $5, $6,$7)
            RETURNING *;
        `;

        const customDish = await pool.query(query,[
            userId,
            analyzedDish.title,
            analyzedDish.serving_size,
            analyzedDish.recipe,
            JSON.stringify(analyzedDish.ingredients),
            JSON.stringify(analyzedDish.macros),
            analyzedDish.prep_time
        ])

        return res.status(201).json({
            message: 'Custom dish analyzed successfully!',
            dish: customDish.rows[0],
        });
    } catch (err) {
        console.log(err)
        return ApiError(res, 500, "Server Error", err);
    }
}


export default { generateDishes, postCustomRecipe };