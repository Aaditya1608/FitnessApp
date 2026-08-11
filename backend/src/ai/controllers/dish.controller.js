import ApiError from "../../utils/apiError.js";
import pool from "../../config/db.js";
import ApiResponse from "../../utils/apiResponse.js";

async function saveDish(req, res) {
    try {
        const { title, serving_size, recipe, ingredients, macros, prep_time } = req.body;
        const userId = req.user.id;

        if (!title || !serving_size || !recipe || !ingredients || !macros || !prep_time) {
            return ApiError(res, 400, "Please provide full dish details to save.");
        }
        const query = `
            INSERT INTO saved_dishes (user_id, title, serving_size, recipe, ingredients, macros,prep_time)
            VALUES ($1, $2, $3, $4, $5, $6,$7)
            RETURNING *;
        `;

        const result = await pool.query(query, [
            userId,
            title,
            serving_size,
            recipe,
            JSON.stringify(ingredients),
            JSON.stringify(macros),
            prep_time
        ]);
        const savedDish = result.rows[0];
        return ApiResponse(res, 201, "Dish Saved Successfully", savedDish);
    } catch (err) {
        return ApiError(res, 500, "Server Error", err);
    }
}

async function logDish(req, res) {
    try {
        const { title, serving_size, recipe, ingredients, macros, prep_time } = req.body;
        const userId = req.user.id;

        if (!title || !serving_size || !recipe || !ingredients || !macros || !macros.calories || !macros.fat || !macros.protein || !macros.carbs || !prep_time) {
            return ApiError(res, 400, "Please provide full dish details and proper macros to log in.");
        }
        const query = `
            INSERT INTO dish_history(user_id, title, serving_size, recipe, ingredients, macros,prep_time)
            VALUES ($1, $2, $3, $4, $5, $6,$7)
            RETURNING *;
        `;

        const result = await pool.query(query, [
            userId,
            title,
            serving_size,
            recipe,
            JSON.stringify(ingredients),
            JSON.stringify(macros),
            prep_time
        ]);
        const loggedDish = result.rows[0];
        return ApiResponse(res, 201, "Dish Logged in Successfully", loggedDish);
    } catch (err) {
        return ApiError(res, 500, "Server Error", err);
    }
}

async function getSavedDishes  (req, res) {
  const userId = req.user.id;
  
  const { ingredient, maxPrepTime, minProtein, maxCalories } = req.query;

  try {
    let query = `SELECT * FROM saved_dishes WHERE user_id = $1`;
    const values = [userId];
    let paramIndex = 2;

    if (ingredient) {
      query += ` AND (
        title ILIKE $${paramIndex} 
        OR EXISTS (
          SELECT 1 FROM jsonb_array_elements(ingredients) elem 
          WHERE elem->>'name' ILIKE $${paramIndex}
        )
      )`;
      values.push(`%${ingredient}%`);
      paramIndex++;
    }

    if (maxPrepTime) {
      query += ` AND prep_time <= $${paramIndex}`;
      values.push(parseInt(maxPrepTime, 10));
      paramIndex++;
    }

    if (minProtein) {
      query += ` AND (macros->>'protein')::numeric >= $${paramIndex}`;
      values.push(parseInt(minProtein, 10));
      paramIndex++;
    }

    if (maxCalories) {
      query += ` AND (macros->>'calories')::numeric <= $${paramIndex}`;
      values.push(parseInt(maxCalories, 10));
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC;`;

    const result = await pool.query(query, values);

    return res.status(200).json({
      count: result.rows.length,
      savedDishes: result.rows,
    });
  } catch (error) {
    console.error('Get saved dishes error:', error);
    return ApiError(res,500,"Server Error");
  }
};

async function deleteSavedDish(req,res){
  try{
    const userId = req.user.id;
    const dishId = req.params.id;

    const query = `delete from saved_dishes where user_id=$1 and id=$2 returning *;`
    const result = await pool.query(query,[userId,dishId]);

    if(result.rows.length===0){
      return ApiError(res,404,"Dish not found in the Saved page");
    }

    return ApiResponse(res,200,"Successfully deleted the dish!",result.rows[0]);

  } catch(err){
    console.log(err)
    return ApiError(res,500,"Server Error");
  }
}

export default { saveDish, logDish, getSavedDishes,deleteSavedDish };