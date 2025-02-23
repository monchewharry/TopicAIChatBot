import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';
import { getChatById, getMessagesByChatId } from '@/lib/db/queries';
import { convertToUIMessages } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { DEFAULT_CHAT_TOPIC } from '@/lib/ai/topics';
import type { TopicInputs, TopicIds } from '@/lib/definitions';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const chat = await getChatById({ id });

  if (!chat) {
    notFound();
  }

  const session = await auth();

  if (chat.visibility === 'private') {
    if (!session || !session.user) {
      return notFound();
    }

    if (session.user.id !== chat.userId) {
      return notFound();
    }
  }
  const chatTopicData = chat.topicInputValues as TopicInputs;
  console.log("chatTopicData", chatTopicData);
  const messagesFromDb = await getMessagesByChatId({
    id,
  });

  const cookieStore = await cookies();
  const chatModelFromCookie = cookieStore.get('chat-model');
  const chatTopicFromCookie = cookieStore.get('chat-topic');

  const selectedChatModel = chatModelFromCookie?.value ?? DEFAULT_CHAT_MODEL;
  const selectedTopicId = chatTopicFromCookie?.value as TopicIds ?? DEFAULT_CHAT_TOPIC;

  return (
    <>
      <Chat
        id={chat.id}
        initialMessages={convertToUIMessages(messagesFromDb)}
        selectedChatModel={selectedChatModel}
        selectedVisibilityType={chat.visibility}
        selectedTopicId={selectedTopicId}
        chatTopicData={chatTopicData}
        isReadonly={session?.user?.id !== chat.userId}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
