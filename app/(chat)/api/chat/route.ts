import {
  createDataStreamResponse,
  smoothStream,
  streamText,
} from 'ai';

import { auth } from '@/app/(auth)/auth';
import { myProvider } from '@/lib/ai/models';
import { systemPrompt } from '@/lib/ai/prompts';
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import {
  generateUUID,
  getMostRecentUserMessage,
  getClientToolsResultMessages,
  sanitizeResponseMessages,
} from '@/lib/utils';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';
import { getBazi, getNatalChart, getDivination } from '@/lib/ai/tools/topicTools/clientToolsSet';
import { generateTitleFromUserMessage } from '../../actions';
import { TopicIds, type RequestBodyItem } from '@/lib/definitions';
import { consoleLogObject } from '@/lib/devtool';

export const maxDuration = 60;

export async function POST(request: Request) {
  const {
    id,
    messages,
    selectedChatModel,
    topicId,
    topicInputValues
  }: RequestBodyItem = await request.json();
  consoleLogObject({ logType: 'request', requestMessages: messages }, { depth: null, colors: true }, true);
  // check if user has sent a PDF
  // const messagesHavePDF = messages.some(message =>
  //   message.experimental_attachments?.some(
  //     a => a.contentType === 'application/pdf',
  //   ),
  // );

  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userMessage = getMostRecentUserMessage(messages);
  consoleLogObject(userMessage);
  if (!userMessage) {
    return new Response('No user message found', { status: 400 });
  }
  // save chat
  const chat = await getChatById({ id });
  if (!chat) {
    const title = await generateTitleFromUserMessage({ message: userMessage });
    await saveChat({ id, userId: session.user.id, title, topicId, topicInputValues });
  }

  // save last user message
  await saveMessages({
    messages: [{ ...userMessage, createdAt: new Date(), chatId: id }],
  });

  // save client tool result
  const clientToolMsgs = getClientToolsResultMessages(messages);
  consoleLogObject(clientToolMsgs);

  if (clientToolMsgs) {
    clientToolMsgs.toolInvocations = clientToolMsgs.toolInvocations?.map(invocation => ({
      ...invocation,
      type: "tool-result"
    }));
    consoleLogObject({ logType: 'requestClientToolMsgs', clientToolMsgs: clientToolMsgs });
    await saveMessages({
      messages: [{
        id: clientToolMsgs.revisionId ?? generateUUID(), //clientToolMsgs.id,// same as the tool-call
        chatId: id,
        role: "tool",
        content: clientToolMsgs.toolInvocations ?? [],
        createdAt: new Date(),
      }],
    });
  }

  return createDataStreamResponse({
    execute: (dataStream) => {
      const result = streamText({
        model: myProvider.languageModel(selectedChatModel),
        system: systemPrompt({ selectedChatModel, topicId }),
        messages,
        maxSteps: 5,
        experimental_activeTools: selectedChatModel === 'chat-model-reasoning'
          ? []
          : topicId === TopicIds.numerology
            ? [
              'getBazi',
              'getNatalChart',

            ] : topicId === TopicIds.divination
              ? [
                // 'getDivination',
              ] : [
                'getWeather',
                'createDocument',
                'updateDocument',
                'requestSuggestions'],// Limits the tools that are available for the model to call
        experimental_transform: smoothStream({ chunking: 'word' }),
        experimental_generateMessageId: generateUUID,
        tools: {
          getBazi,
          getNatalChart,
          getDivination,
          getWeather,
          createDocument: createDocument({ session, dataStream }),
          updateDocument: updateDocument({ session, dataStream }),
          requestSuggestions: requestSuggestions({
            session,
            dataStream,
          }),
        },
        onFinish: async ({ response, reasoning }) => {
          consoleLogObject({ logType: 'response', responseMessages: response.messages });
          // save response
          if (session.user?.id) {
            try {
              const sanitizedResponseMessages = sanitizeResponseMessages({
                messages: response.messages,
                reasoning,
              });
              if (sanitizedResponseMessages.length > 0) {
                await saveMessages({
                  messages: sanitizedResponseMessages.map((message) => {
                    return {
                      id: message.id,
                      chatId: id,
                      role: message.role,
                      content: message.content,
                      createdAt: new Date(),
                    };
                  }),
                });
              }

            } catch (error) {
              console.error('Failed to save Message');
              consoleLogObject(response.messages)
            }
          }
        },
        experimental_telemetry: {
          isEnabled: true,
          functionId: 'stream-text',
        },
      });

      result.mergeIntoDataStream(dataStream, {
        sendReasoning: true,
      });
    },
    onError: () => {
      return 'Oops, an error occured!';
    },
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}
