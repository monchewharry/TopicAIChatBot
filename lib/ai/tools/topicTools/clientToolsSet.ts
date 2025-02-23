import { tool } from 'ai';
import { z } from 'zod';
// client-side tool that starts user interaction:
export const askForBirthConfirmation = tool({
    description: 'tool to display the birth date time and gender.',
    parameters: z.object({
        message: z.string().describe('The message to display the selected date time and gender of birth.'),
    }),
});

// client-side tool that is automatically executed on the client:
export const getBazi = tool({
    description: '生辰八字,get bazi.',
    parameters: z.object({})
});

export const getNatalChart = tool({
    description: '紫微斗数星盘,get natal chart,本命盘,运限盘',
    parameters: z.object({}),
});
