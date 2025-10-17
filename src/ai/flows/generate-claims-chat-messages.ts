'use server';

/**
 * @fileOverview Generates claim-related messages using relevant order details.
 *
 * - generateClaimMessage - A function that generates an initial claim message.
 * - GenerateClaimMessageInput - The input type for the generateClaimMessage function.
 * - GenerateClaimMessageOutput - The return type for the generateClaimMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateClaimMessageInputSchema = z.object({
  orderDetailId: z.number().describe('The ID of the order detail.'),
  clientName: z.string().describe('The name of the client.'),
  productName: z.string().describe('The name of the product.'),
  quantity: z.number().describe('The quantity of the product.'),
  status: z.string().describe('The status of the order detail.'),
  claimDetails: z.string().describe('The details of the claim.'),
});
export type GenerateClaimMessageInput = z.infer<typeof GenerateClaimMessageInputSchema>;

const GenerateClaimMessageOutputSchema = z.object({
  message: z.string().describe('The generated claim message.'),
});
export type GenerateClaimMessageOutput = z.infer<typeof GenerateClaimMessageOutputSchema>;

export async function generateClaimMessage(input: GenerateClaimMessageInput): Promise<GenerateClaimMessageOutput> {
  return generateClaimMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateClaimMessagePrompt',
  input: {schema: GenerateClaimMessageInputSchema},
  output: {schema: GenerateClaimMessageOutputSchema},
  prompt: `You are a customer support representative generating an initial claim message for a customer.

  Use the following information to generate the message:

  Client Name: {{{clientName}}}
  Product Name: {{{productName}}}
  Quantity: {{{quantity}}}
  Order Detail Status: {{{status}}}
  Claim Details: {{{claimDetails}}}

  Generate a concise and professional message to acknowledge the claim and indicate that it will be investigated.`,
});

const generateClaimMessageFlow = ai.defineFlow(
  {
    name: 'generateClaimMessageFlow',
    inputSchema: GenerateClaimMessageInputSchema,
    outputSchema: GenerateClaimMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
