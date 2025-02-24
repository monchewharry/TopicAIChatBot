import { tool } from 'ai';
import { z } from 'zod';
// client-side tool that is automatically executed on the client:
export const getBazi = tool({
    description: '生辰八字,get bazi.',
    parameters: z.object({})
});

export const getNatalChart = tool({
    description: '紫微斗数星盘,get natal chart,本命盘,运限盘',
    parameters: z.object({}),
});

export const getDivination = tool({
    description: '卜筮,占卜,get divination,',
    parameters: z.object({}),
});
