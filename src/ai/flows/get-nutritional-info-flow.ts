
'use server';
/**
 * @fileOverview An AI flow to get estimated nutritional information for a recipe.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NutritionalInfoSchema = z.object({
  calories: z.number().describe('Estimated total calories for the recipe.'),
  protein: z.number().describe('Estimated grams of protein.'),
  carbs: z.number().describe('Estimated grams of carbohydrates.'),
  fat: z.number().describe('Estimated grams of fat.'),
});
export type NutritionalInfo = z.infer<typeof NutritionalInfoSchema>;

const GetNutritionalInfoInputSchema = z.object({
  name: z.string().describe('The name of the recipe.'),
  ingredients: z.array(z.string()).describe('A list of ingredients in the recipe.'),
});
export type GetNutritionalInfoInput = z.infer<typeof GetNutritionalInfoInputSchema>;

export async function getNutritionalInfo(input: GetNutritionalInfoInput): Promise<NutritionalInfo> {
  return getNutritionalInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getNutritionalInfoPrompt',
  input: {schema: GetNutritionalInfoInputSchema},
  output: {schema: NutritionalInfoSchema},
  prompt: `You are a nutrition expert. Based on the recipe name and ingredients, provide an estimated nutritional breakdown.

  Recipe: {{{name}}}
  Ingredients:
  {{#each ingredients}}- {{this}}\n{{/each}}

  Return the estimated calories, protein (in grams), carbs (in grams), and fat (in grams).`,
});

const getNutritionalInfoFlow = ai.defineFlow(
  {
    name: 'getNutritionalInfoFlow',
    inputSchema: GetNutritionalInfoInputSchema,
    outputSchema: NutritionalInfoSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
