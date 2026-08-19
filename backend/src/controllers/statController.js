import pool from "../config/db.js";
import ApiError from "../utils/apiError.js";
export const getStatsByDate = async (req, res) => {
  const userId = req.user.id;
  // Default to today's date if no date query param is provided
  const targetDate = req.query.date || new Date().toISOString().split('T')[0];

  try {
    const userDetailsResult = await pool.query(
      'SELECT target_calories, goal FROM user_details WHERE user_id = $1',
      [userId]
    );

    const targetCalories = userDetailsResult.rows[0]?.target_calories || 2000;

    const statsQuery = `
      SELECT
        COUNT(*)::int AS total_dishes,
        COALESCE(SUM((macros->>'calories')::numeric), 0) AS consumed_calories,
        COALESCE(SUM((macros->>'protein')::numeric), 0) AS consumed_protein,
        COALESCE(SUM((macros->>'carbs')::numeric), 0) AS consumed_carbs,
        COALESCE(SUM((macros->>'fat')::numeric), 0) AS consumed_fat
      FROM dish_history
      WHERE user_id = $1 
        AND DATE(logged_at AT TIME ZONE 'UTC') = $2::date;
    `;

    const statsResult = await pool.query(statsQuery, [userId, targetDate]);
    const totals = statsResult.rows[0];


    const mealsQuery = `
      SELECT id, title, macros, logged_at 
      FROM dish_history 
      WHERE user_id = $1 
        AND DATE(logged_at AT TIME ZONE 'UTC') = $2::date
      ORDER BY logged_at ASC;
    `;

    const mealsResult = await pool.query(mealsQuery, [userId, targetDate]);

    const consumedCalories = parseFloat(totals.consumed_calories);

    return res.status(200).json({
      date: targetDate,
      targetCalories,
      totalDishes: totals.total_dishes,
      consumed: {
        calories: consumedCalories,
        protein: parseFloat(totals.consumed_protein),
        carbs: parseFloat(totals.consumed_carbs),
        fat: parseFloat(totals.consumed_fat),
      },
      meals: mealsResult.rows, // Detailed list of logged dishes for the day
    });
  } catch (error) {
    console.error('Get stats by date error:', error);
    return ApiError(res, 500, "Server Error");

  }
};

export const getMonthlySummary = async (req, res) => {
  const userId = req.user.id;
  const { year, month } = req.query; // e.g., year=2026, month=8

  if (!year || !month) {
    return ApiError(res, 400, "Please provide year and month query parameters.")
  }

  try {
    // Aggregates calories by day for an entire calendar month
    const query = `
      SELECT 
        TO_CHAR(logged_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS date,
        SUM((macros->>'calories')::numeric) AS total_calories,
        SUM((macros->>'protein')::numeric) AS total_protein,
        count(*)::int as total_dishes
      FROM dish_history
      WHERE user_id = $1 
        AND EXTRACT(YEAR FROM logged_at) = $2
        AND EXTRACT(MONTH FROM logged_at) = $3
      GROUP BY TO_CHAR(logged_at AT TIME ZONE 'UTC', 'YYYY-MM-DD')
      ORDER BY date ASC;
    `;

    const result = await pool.query(query, [userId, year, month]);

    return res.status(200).json({
      year,
      month,
      dailySummaries: result.rows,
    });
  } catch (error) {
    console.error('Get monthly summary error:', error);
    return ApiError(res, 500, "Server Error");
  }
};

export default { getStatsByDate, getMonthlySummary };