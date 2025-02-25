
import { TopicIds } from '../definitions';
import { regularPrompt, blocksPrompt } from './prompts/generalPrompts';
import { topicPrompts } from './prompts/topicPrompts';
export const systemPrompt = ({
  selectedChatModel,
  topicId,
}: {
  selectedChatModel: string;
  topicId: TopicIds;
}) => {
  if (selectedChatModel === 'chat-model-reasoning') { // disable block
    return `${regularPrompt}\n\n${topicPrompts[topicId]}`;
  } else if (topicId !== TopicIds.general) {
    return `${regularPrompt}\n\n${topicPrompts[topicId]}\n\n${blocksPrompt}`;
  }
};