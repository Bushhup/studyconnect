'use server';
/**
 * @fileOverview Academic AI Assistant Flow.
 * 
 * - helpStudent - Function to provide academic and institutional guidance.
 * - AssistantInput - User query and role context.
 * - AssistantOutput - AI response and suggested follow-up actions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AssistantInputSchema = z.object({
  query: z.string().describe('The user query.'),
  userRole: z.enum(['student', 'faculty', 'admin', 'hod']).describe('Role of the user asking the question.'),
  userName: z.string().optional().describe('Name of the user.'),
});

export type AssistantInput = z.infer<typeof AssistantInputSchema>;

const AssistantOutputSchema = z.object({
  message: z.string().describe('The main response from the AI.'),
  suggestedActions: z.array(z.string()).describe('List of quick actions or links related to the response.'),
});

export type AssistantOutput = z.infer<typeof AssistantOutputSchema>;

export async function askAcademicAssistant(input: AssistantInput): Promise<AssistantOutput> {
  return academicAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'academicAssistantPrompt',
  input: { schema: AssistantInputSchema },
  output: { schema: AssistantOutputSchema },
  prompt: `You are the StudyConnect Institutional AI Assistant. 
Your goal is to help users navigate the academic portal and answer institutional queries.

User Information:
Name: {{{userName}}}
Role: {{{userRole}}}
Query: {{{query}}}

Context Guidelines:
- If the user is a student, focus on subjects, attendance, grades, and campus events.
- If the user is faculty, focus on class management, mark entry, and research profiles.
- If the user is admin/hod, focus on institutional oversight, user management, and department performance.
- Always maintain a professional, helpful, and encouraging academic tone.
- If you don't know the specific answer, guide them to contact the Registrar or use the search bar.

Response Format:
Provide a clear, concise message and 2-3 relevant suggested actions (e.g., "View Attendance", "Check Grades", "Contact HOD").`,
});

const academicAssistantFlow = ai.defineFlow(
  {
    name: 'academicAssistantFlow',
    inputSchema: AssistantInputSchema,
    outputSchema: AssistantOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
