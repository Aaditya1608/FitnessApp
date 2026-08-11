/* input : ingredients in json form 
                {
                    "ingredient 1": "quantity 1",
                    "ingredient 2": "quantity 2",
                    ....
                    "ingredient n": "quantity n",
                } 
            recipe in array form 
                [
                    "Step 1: ",
                    "Step 2: ",
                    ....
                    "Step n: "
                ]

    output: Based on the ingredients, and the recipe given by the user, AI generates macro content, proposed prep + cooking time, and the serving size depending on the quantity of ingredients respectively..

    the output will be shaped up to 

    prompt to gemini: now that we are done with the search filters, lets move on to our last main API, which is, post custom dishes, where the user posts his custom dish recipe and the ingredients required, and AI finds the macros content and etc, and makes a typical dish schema 
*/
import { GoogleGenAI, Type } from "@google/genai";



/**
 * Analyzes a user's custom recipe & ingredients to estimate macros, serving size, and prep time.
 */
export const analyzeCustomRecipeWithAI = async ({ title, ingredients, recipeSteps }) => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    // Format the user's key-value ingredients into a readable string for the prompt
    const formattedIngredients = Object.entries(ingredients)
        .map(([ingredient, quantity]) => `- ${ingredient}: ${quantity}`)
        .join('\n');

    const formattedRecipe = recipeSteps
        .map((step, index) => `Step ${index + 1}: ${step}`)
        .join('\n');

    const prompt = `
    You are an expert nutritionist and culinary mathematician.
    A user has provided their custom home recipe details.
    
    Dish Name: ${title || 'Custom Home Recipe'}
    
    Ingredients & Quantities:
    ${formattedIngredients}
    
    Preparation & Cooking Instructions:
    ${formattedRecipe}

    Tasks:
    1. Calculate accurately the total macros (calories, protein, carbs, fat) for the entire dish or realistic single serving based on the ingredient quantities provided.
    2. Estimate a standard serving size (e.g., "1 bowl (350g)" or "2 slices").
    3. Estimate total preparation and cooking time in minutes (prep_time).
    4. Format the ingredients list cleanly as an array of objects containing 'name' and 'amount'.
    5. Refine and format the step-by-step recipe array.
  `;

    // JSON Schema for a SINGLE custom dish object
    const customDishSchema = {
        type: Type.OBJECT,
        description: 'Structured custom dish analysis',
        properties: {
            title: { type: Type.STRING, description: 'Name of the custom dish' },
            serving_size: { type: Type.STRING, description: 'e.g., 1 plate (300g)' },
            prep_time: {
                type: Type.INTEGER,
                description: 'Estimated prep + cooking time in minutes',
            },
            recipe: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Formated step-by-step instructions',
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
        },
        required: ['title', 'serving_size', 'prep_time', 'recipe', 'ingredients', 'macros'],
    };

    const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash', // Use your active Gemini model
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: customDishSchema,
        },
    });

    return JSON.parse(response.text);
};