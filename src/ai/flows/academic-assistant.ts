'use server';
/**
 * @fileOverview Academic AI Assistant Flow.
 * 
 * - askAcademicAssistant - Function to provide academic and institutional guidance.
 * - AssistantInput - User query, role context, and conversation history.
 * - AssistantOutput - AI response and suggested follow-up actions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AssistantInputSchema = z.object({
  query: z.string().describe('The user query.'),
  userRole: z.enum(['student', 'faculty', 'admin', 'hod']).describe('Role of the user asking the question.'),
  userName: z.string().optional().describe('Name of the user.'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.array(z.object({ text: z.string() }))
  })).optional().describe('The conversation history for multi-turn chat.'),
});

export type AssistantInput = z.infer<typeof AssistantInputSchema>;

const AssistantOutputSchema = z.object({
  message: z.string().describe('The main response from the AI.'),
  suggestedActions: z.array(z.string()).describe('List of quick actions or navigation links (e.g. "nav:/student/attendance").'),
});

export type AssistantOutput = z.infer<typeof AssistantOutputSchema>;

export async function askAcademicAssistant(input: AssistantInput): Promise<AssistantOutput> {
  return academicAssistantFlow(input);
}

const academicAssistantFlow = ai.defineFlow(
  {
    name: 'academicAssistantFlow',
    inputSchema: AssistantInputSchema,
    outputSchema: AssistantOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      system: `You are the StudyConnect Institutional AI Assistant. 
Your goal is to help users navigate the academic portal and answer institutional queries.

User Context:
- Name: ${input.userName || 'User'}
- Role: ${input.userRole}

Guidelines:
- If the user is a student, focus on subjects, attendance, grades, and campus events.
- If the user is faculty, focus on class management, mark entry, and research profiles.
- If the user is admin/hod, focus on institutional oversight, user management, and department performance.
- Always maintain a professional, helpful, and encouraging academic tone.
- Keep responses concise and formatted for a chat bubble.
- Suggest 2-3 relevant actions. Use "nav:" prefix for direct navigation (e.g., "nav:/student/attendance").`,
      messages: input.history || [],
      prompt: input.query,
      output: { schema: AssistantOutputSchema },
    });

    return output!;
  }
);
