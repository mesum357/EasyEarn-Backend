
'use server';
/**
 * @fileOverview An AI-powered calculation engine.
 *
 * - getCalculatorDefinition - A function that returns the definition of a calculator.
 * - calculateResult - A function that calculates the result based on inputs.
 * - CalculatorInput - The input type for the getCalculatorDefinition function.
 * - CalculatorDefinition - The output type for the getCalculatorDefinition function.
 * - CalculationInput - The input type for the calculateResult function.
 * - CalculationOutput - The output type for the calculateResult function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Schema for defining a single input field
const FieldSchema = z.object({
  name: z.string().describe('The name of the field (e.g., "loanAmount").'),
  label: z.string().describe('The user-friendly label for the field (e.g., "Loan Amount").'),
  type: z.enum(['number', 'text']).default('number').describe('The input type.'),
});

// Schema for the overall calculator definition
const CalculatorDefinitionSchema = z.object({
  title: z.string().describe('The title of the calculator.'),
  description: z.string().describe('A brief description of what the calculator does.'),
  input_fields: z.array(FieldSchema).describe('An array of input fields required for the calculation.'),
  output_format: z.object({
    result_name: z.string().describe('The name of the result field (e.g., "monthlyPayment").'),
    result_label: z.string().describe('The user-friendly label for the result (e.g., "Monthly Payment").'),
    unit: z.string().optional().describe('The unit of the result, if any (e.g., "$", "%").'),
  }).describe('The format of the output.'),
});

export type CalculatorDefinition = z.infer<typeof CalculatorDefinitionSchema>;

// Schema for the input to get a calculator definition
const CalculatorInputSchema = z.object({
  query: z.string().describe('The user\'s request for a calculator, e.g., "Mortgage Calculator" or "convert feet to meters".'),
});
export type CalculatorInput = z.infer<typeof CalculatorInputSchema>;


// --- Flow to get the calculator definition ---

const definitionPrompt = ai.definePrompt({
  name: 'getCalculatorDefinitionPrompt',
  input: { schema: CalculatorInputSchema },
  output: { schema: CalculatorDefinitionSchema },
  prompt: `You are an expert at creating calculator definitions. Based on the user's query, define the calculator.
  
  Query: {{{query}}}
  
  Provide a clear title, a brief description, the necessary input fields, and the format of the output.
  For input field names, use camelCase. For labels, use title case.`,
});

const getCalculatorDefinitionFlow = ai.defineFlow(
  {
    name: 'getCalculatorDefinitionFlow',
    inputSchema: CalculatorInputSchema,
    outputSchema: CalculatorDefinitionSchema,
  },
  async (input) => {
    const { output } = await definitionPrompt(input);
    return output!;
  }
);

export async function getCalculatorDefinition(input: CalculatorInput): Promise<CalculatorDefinition> {
  return getCalculatorDefinitionFlow(input);
}


// --- Flow to calculate the result ---

// Schema for the input to the calculation
const CalculationInputSchema = z.object({
  query: z.string().describe('The original user query for the calculator.'),
  inputs: z.record(z.number()).describe('An object where keys are the field names and values are the user-provided numbers.'),
});
export type CalculationInput = z.infer<typeof CalculationInputSchema>;

// Schema for the output of the calculation
const CalculationOutputSchema = z.object({
  result: z.number().describe('The calculated numerical result.'),
});
export type CalculationOutput = z.infer<typeof CalculationOutputSchema>;


const calculationPrompt = ai.definePrompt({
  name: 'calculateResultPrompt',
  input: { schema: CalculationInputSchema },
  output: { schema: CalculationOutputSchema },
  prompt: `You are a powerful calculation engine. Based on the calculator query and the user's inputs, calculate the result.
  
  Calculator Query: {{{query}}}
  
  User Inputs:
  {{#each (Object.entries inputs)}}
  - {{this.[0]}}: {{this.[1]}}
  {{/each}}

  Only return the final numerical result. Do not provide an explanation.`,
});


const calculateResultFlow = ai.defineFlow(
  {
    name: 'calculateResultFlow',
    inputSchema: CalculationInputSchema,
    outputSchema: CalculationOutputSchema,
  },
  async (input) => {
    const { output } = await calculationPrompt(input);
    return output!;
  }
);

export async function calculateResult(input: CalculationInput): Promise<CalculationOutput> {
  return calculateResultFlow(input);
}
