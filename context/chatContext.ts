import { createContext, useContext } from 'react';
import type { Dispatch, SetStateAction } from "react";
import type { TopicInputs } from '@/lib/definitions';

interface ChatContextType {
    topicInputValues: TopicInputs;
    setTopicInputValues: Dispatch<SetStateAction<TopicInputs>>;

    isTopicInputComplete: boolean;
    setIsTopicInputComplete: Dispatch<SetStateAction<boolean>>;

    sourceIds: string[]; // RAG source materials' id
    setSourceIds: Dispatch<SetStateAction<string[]>>;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);


// Custom hook for easy access
export function useChatContext() {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("useChatContext must be used within a Provider inside Chat()");
    }
    return context;
}