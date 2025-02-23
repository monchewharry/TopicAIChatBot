import { cookies } from 'next/headers';

import { Chat } from '@/components/chat';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { DEFAULT_CHAT_TOPIC } from '@/lib/ai/topics';
import { generateUUID } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';
import type { TopicIds } from '@/lib/definitions';
export default async function Page() {
  const id = generateUUID();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('chat-model');
  const topicIdFromCookie = cookieStore.get('chat-topic');

  const modelId = modelIdFromCookie?.value ?? DEFAULT_CHAT_MODEL;

  const selectedTopicId = topicIdFromCookie?.value as TopicIds ?? DEFAULT_CHAT_TOPIC;
  return (
    <>
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        selectedChatModel={modelId}
        selectedVisibilityType="private"
        selectedTopicId={selectedTopicId}
        isReadonly={false}
      />

      <DataStreamHandler id={id} />
    </>
  );
}
