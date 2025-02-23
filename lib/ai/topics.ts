import { TopicIds } from "../definitions";
export const DEFAULT_CHAT_TOPIC = TopicIds.numerology;

interface ChatTopics {
    id: TopicIds;
    name: string;
    description: string;
}

export const chatTopics: Array<ChatTopics> = [
    {
        id: TopicIds.numerology,
        name: '中华命理',
        description: '八字，紫微斗数',
    },
    {
        id: TopicIds.divination,
        name: '周易占卜',
        description: '卦象，占卜，问答',
    },
];
