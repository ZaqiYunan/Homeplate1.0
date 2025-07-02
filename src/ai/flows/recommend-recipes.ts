
'use server';

/**
 * @fileOverview Recipe recommendation AI agent.
 *
 * - recommendRecipes - A function that recommends recipes based on available ingredients.
 * - RecommendRecipesInput - The input type for the recommendRecipes function.
 * - RecommendRecipesOutput - The return type for the recommendRecipes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendRecipesInputSchema = z.object({
  ingredients: z
    .array(z.string())
    .optional()
    .describe('An array of ingredients the user has available.'),
  query: z
    .string()
    .optional()
    .describe("The user's direct query, e.g., 'chicken stir fry' or 'quick breakfast'"),
  strictMode: z
    .boolean()
    .describe('If true, only use available ingredients. If false, AI can add ingredients.'),
  numRecipes: z
    .number()
    .default(3)
    .describe('The number of recipes to recommend.'),
});
export type RecommendRecipesInput = z.infer<typeof RecommendRecipesInputSchema>;

const RecipeSchema = z.object({
  name: z.string().describe('The name of the recipe.'),
  ingredients: z.array(z.string()).describe('The ingredients required for the recipe.'),
  instructions: z.string().describe('The step-by-step instructions for the recipe.'),
  url: z.string().optional().describe('A link to the recipe on the web.'),
  missingIngredients: z
    .array(z.string())
    .optional()
    .describe("A list of ingredients required for the recipe that are NOT in the user's available ingredients list."),
});

const RecommendRecipesOutputSchema = z.object({
  recipes: z.array(RecipeSchema).describe('An array of recommended recipes.'),
});
export type RecommendRecipesOutput = z.infer<typeof RecommendRecipesOutputSchema>;

export async function recommendRecipes(input: RecommendRecipesInput): Promise<RecommendRecipesOutput> {
  return recommendRecipesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendRecipesPrompt',
  input: {schema: RecommendRecipesInputSchema},
  output: {schema: RecommendRecipesOutputSchema},
  prompt: `You are a recipe recommendation expert. Your primary goal is to help a user decide what to cook.

{{#if strictMode}}
You are in "Use My Storage" mode. The user wants to cook using ONLY the ingredients they have.
Your suggestions should maximize the use of these ingredients.

Available ingredients:
{{#each ingredients}}
- {{this}}
{{/each}}

If a common complementary ingredient (like salt, pepper, oil, water) is essential for the recipe but not in the available list, you MUST list it in the 'missingIngredients' field. Do not list main ingredients as missing.
{{else}}
You are in "Creative Mode". The user wants ideas for "{{query}}".
{{#if ingredients}}
They have the following ingredients available, which you should try to incorporate, but you are not limited to them:
Available ingredients:
{{#each ingredients}}
- {{this}}
{{/each}}
{{else}}
The user has not specified any available ingredients.
{{/if}}

Suggest creative recipes that match the user's query. The recipes can and should include ingredients the user does not have.
You MUST list any required ingredients that are not in the user's 'Available ingredients' list into the 'missingIngredients' field for each recipe.
{{/if}}

Please suggest {{numRecipes}} recipes.
Each Recipe object should include the recipe name, a complete list of all required ingredients, the step-by-step instructions, and the 'missingIngredients' list.
Ensure the ingredients in the Recipe object are a list of individual ingredients as opposed to a sentence.
`,
});

const recommendRecipesFlow = ai.defineFlow(
  {
    name: 'recommendRecipesFlow',
    inputSchema: RecommendRecipesInputSchema,
    outputSchema: RecommendRecipesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
