'use server';

import {
  generateClaimMessage,
  type GenerateClaimMessageInput,
} from '@/ai/flows/generate-claims-chat-messages';
import { revalidatePath } from 'next/cache';

export async function handleGenerateClaimMessage(
  input: GenerateClaimMessageInput
) {
  try {
    const result = await generateClaimMessage(input);
    revalidatePath('/sales/claims');
    return { success: true, message: result.message };
  } catch (error) {
    console.error('Error generating claim message:', error);
    return { success: false, error: 'Failed to generate message.' };
  }
}
