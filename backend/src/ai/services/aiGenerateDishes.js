import { GoogleGenAI, Type } from "@google/genai";

export const generateRecipesWithAI = async ({ ingredients, userDetails }) => {
    // Initialize inside the function to ensure process.env.GEMINI_API_KEY is available
    // after dotenv has loaded in your main server file.
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const { weight, height, age, sex, goal, target_calories } = userDetails;

    const prompt = `
    You are an expert nutritionist and chef.
    The user has the following ingredients available: ${ingredients.join(', ')}.
    
    User Profile:
    - Fitness Goal: ${goal}
    - Daily Target Calories: ${target_calories} kcal
    - Gender: ${sex}
    - Weight: ${weight} kg, Height: ${height} cm
    - Age: ${age}

    Generate exactly 3 distinct, delicious recipes using the provided ingredients (and common pantry staples like salt, oil, water, basic spices if needed).
    Ensure the macro ratios (calories, protein, carbs, fat) align well with their fitness goal of ${goal}.
    Include realistic prep + cooking time in minutes (as an integer for prep_time) for each dish.
  `;

    // Define JSON Schema response structure
    const recipeSchema = {
        type: Type.ARRAY,
        description: 'List of 3 generated recipes',
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: 'Name of the dish' },
                serving_size: { type: Type.STRING, description: 'e.g., 1 bowl (300g)' },
                recipe: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Step-by-step cooking instructions',
                },
                ingredients: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            amount: { type: Type.STRING },
                        },
                        required: ['name', 'amount'],
                    },
                },
                macros: {
                    type: Type.OBJECT,
                    properties: {
                        calories: { type: Type.INTEGER },
                        protein: { type: Type.INTEGER, description: 'in grams' },
                        carbs: { type: Type.INTEGER, description: 'in grams' },
                        fat: { type: Type.INTEGER, description: 'in grams' },
                    },
                    required: ['calories', 'protein', 'carbs', 'fat'],
                },
                prep_time: {
                    type: Type.INTEGER,
                    description: 'Total prep and cooking time in minutes'
                }
            },
            required: ['title', 'serving_size', 'recipe', 'ingredients', 'macros','prep_time'],
        },
    };

    const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: recipeSchema,
        },
    });

    return JSON.parse(response.text);
};