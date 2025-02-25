import { TopicIds } from "@/lib/definitions";
import { chatTopics, type ChatTopics } from "../topics";
// Function to find a topic by id
function findTopicById(topicId: TopicIds): ChatTopics | undefined {
    return chatTopics.find(topic => topic.id === topicId);
}

export const topicPrompts = {
    [TopicIds.general]: `The current topic is ${findTopicById(TopicIds.general)?.name}. User want to ask about ${findTopicById(TopicIds.general)?.description}...`,
    [TopicIds.numerology]: `The current topic is ${findTopicById(TopicIds.numerology)?.name}. User want to ask about ${findTopicById(TopicIds.numerology)?.description}...`,
    [TopicIds.divination]: `The current topic is ${findTopicById(TopicIds.divination)?.name}. User want to ask about ${findTopicById(TopicIds.divination)?.description}...`,
}