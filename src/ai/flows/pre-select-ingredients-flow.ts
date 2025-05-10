'use server';

/**
 * @fileOverview A flow to pre-select preferred ingredients for recipe recommendations.
 *
 * - preSelectIngredients - A function that handles the pre-selection of ingredients.
 * - PreSelectIngredientsInput - The input type for the preSelectIngredients function.
 * - PreSelectIngredientsOutput - The return type for the preSelectIngredients function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PreSelectIngredientsInputSchema = z.object({
  ingredients: z
    .array(z.string())
    .describe('A list of ingredients the user wants to prioritize in the recipe recommendation.'),
});
export type PreSelectIngredientsInput = z.infer<typeof PreSelectIngredientsInputSchema>;

const PreSelectIngredientsOutputSchema = z.object({
  message: z
    .string()
    .describe('A message confirming the pre-selected ingredients will be used in recipe recommendations.'),
});
export type PreSelectIngredientsOutput = z.infer<typeof PreSelectIngredientsOutputSchema>;

export async function preSelectIngredients(input: PreSelectIngredientsInput): Promise<PreSelectIngredientsOutput> {
  return preSelectIngredientsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'preSelectIngredientsPrompt',
  input: {schema: PreSelectIngredientsInputSchema},
  output: {schema: PreSelectIngredientsOutputSchema},
  prompt: `You have pre-selected the following ingredients: {{{ingredients}}}. These ingredients will be prioritized in your recipe recommendations.\n\nConfirmation Message: Acknowledge that the user's preferred ingredients will be used to generate recipe recommendations.`,
});

const preSelectIngredientsFlow = ai.defineFlow(
  {
    name: 'preSelectIngredientsFlow',
    inputSchema: PreSelectIngredientsInputSchema,
    outputSchema: PreSelectIngredientsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
