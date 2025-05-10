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
    .describe('An array of ingredients available to the user.'),
  preferredIngredients: z
    .array(z.string())
    .optional()
    .describe('An optional array of ingredients the user prefers to use.'),
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
  prompt: `You are a recipe recommendation expert. Given the ingredients a user has available, you will suggest recipes that utilize as many of the user's ingredients as possible.

  The user has the following ingredients available:
  {{#each ingredients}}- {{this}}\n{{/each}}

  {{#if preferredIngredients}}
  The user prefers to use the following ingredients:
  {{#each preferredIngredients}}- {{this}}\n{{/each}}
  {{/if}}

  Please suggest {{numRecipes}} recipes, formatted as a JSON array of Recipe objects.
  Each Recipe object should include the recipe name, a list of ingredients, the step-by-step instructions, and optionally a url of the recipe.
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
