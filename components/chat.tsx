'use client';

import type { Attachment, Message, ToolCall } from 'ai';
import { useChat } from 'ai/react';
import { useState, useRef, useEffect, useCallback } from "react";
import useSWR, { useSWRConfig } from 'swr';

import { ChatHeader } from '@/components/chat-header';
import type { Vote } from '@/lib/db/schemas/schema';
import { fetcher, generateUUID } from '@/lib/utils';

import { Block } from './block';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import type { VisibilityType } from './visibility-selector';
import { useBlockSelector } from '@/hooks/use-block';
import { toast } from 'sonner';
import { bySolar } from 'iztro/lib/astro';
import { type TopicInputs, type ClientToolCallResult, type RequestBodyItem, TopicIds } from '@/lib/definitions';
import { getAllOriginalPalacesStarsData } from '@/lib/ai/tools/topicTools/clientToolsAction'
import { DEFAULT_CHAT_TOPIC } from '@/lib/ai/topics';
import { ChatContext } from '@/context/chatContext';
/**
 * Chat Component uses the useChat hook
 */
export function Chat({
  id,
  initialMessages,
  selectedChatModel,
  selectedVisibilityType,
  selectedTopicId,
  chatTopicData,
  isReadonly,
}: {
  id: string; // chatId
  initialMessages: Array<Message>;
  selectedChatModel: string;
  selectedVisibilityType: VisibilityType;
  selectedTopicId: TopicIds;
  chatTopicData?: TopicInputs;
  isReadonly: boolean;
}) {
  const { mutate } = useSWRConfig();
  const [sourceIds, setSourceIds] = useState<string[]>([]);
  const todayStr = "1999-01-01";//new Date().toLocaleDateString('en-CA')
  const CompleteInitialier = useCallback(() => {
    if (chatTopicData) {
      return true
    }
    return false
  }, [chatTopicData]);
  const TopicInputValuesInitialier = useCallback((): TopicInputs => {
    if (chatTopicData) {
      return chatTopicData
    }
    if (selectedTopicId === TopicIds.numerology) {
      return {
        topicId: TopicIds.numerology,
        solarDateStr: todayStr,
        timeIndex: 0,
        gender: 'male',
      };
    } else if (selectedTopicId === TopicIds.divination) {
      return {
        topicId: TopicIds.divination,
        hexagram: '',
        method: undefined,
        startQuestion: undefined,
      };
    } else {
      return {
        topicId: DEFAULT_CHAT_TOPIC, // Default topic
      };
    }
  }, [chatTopicData, selectedTopicId]);

  const [isTopicInputComplete, setIsTopicInputComplete] = useState<boolean>(CompleteInitialier);
  useEffect(() => {
    if (selectedTopicId === TopicIds.general) {
      setIsTopicInputComplete(true)
    };
  }, [selectedTopicId]);
  const [topicInputValues, setTopicInputValues] = useState<TopicInputs>(TopicInputValuesInitialier);

  const topicInputValuesRef = useRef(topicInputValues);
  // updateing the ref value won't re-render the component
  useEffect(() => {
    topicInputValuesRef.current = topicInputValues;
  }, [topicInputValues]);

  async function clientToolCall(
    { toolCall }: { toolCall: ToolCall<string, unknown> }
  ): Promise<ClientToolCallResult> {

    const currentTopicInputValues = topicInputValuesRef.current; // Get the latest value
    let result: ClientToolCallResult;
    if (currentTopicInputValues.topicId === TopicIds.numerology) {
      // console.log('solarDateStr in myOnToolCall', currentTopicInputValues.solarDateStr);
      const astrolabeData = bySolar(
        currentTopicInputValues.solarDateStr,
        currentTopicInputValues.timeIndex,
        currentTopicInputValues.gender);
      switch (toolCall.toolName) {
        case 'getBazi':
          result = astrolabeData.chineseDate;
          break;
        case 'getNatalChart':
          result = getAllOriginalPalacesStarsData(astrolabeData);
          break;
      }
    } else if (currentTopicInputValues.topicId === TopicIds.divination) {
      switch (toolCall.toolName) {
        case 'getDivination':
          result = currentTopicInputValues.currentGua
          break;
      }
    }
    return result;
  };
  // customized body part per HTTP Request
  const chatBodyPart: Omit<RequestBodyItem, 'messages'> = {
    id, selectedChatModel,
    topicId: selectedTopicId, topicInputValues, sourceIds
  };
  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
    reload,
    addToolResult
  } = useChat({
    id,
    body: chatBodyPart,
    initialMessages,
    experimental_throttle: 100,
    sendExtraMessageFields: true, // send id and createdAt for each message
    generateId: generateUUID,
    onToolCall: clientToolCall,
    onFinish: () => {
      mutate('/api/history');
    },
    onError: (error) => {
      console.dir(error)
      toast.error('An error occured, please try again!');
    },
  });

  const { data: votes } = useSWR<Array<Vote>>(
    `/api/vote?chatId=${id}`,
    fetcher,
  );

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isBlockVisible = useBlockSelector((state) => state.isVisible);

  return (
    <ChatContext.Provider value={{
      topicInputValues, setTopicInputValues,
      isTopicInputComplete, setIsTopicInputComplete,
      sourceIds, setSourceIds
    }}>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader
          chatId={id}
          selectedModelId={selectedChatModel}
          selectedVisibilityType={selectedVisibilityType}
          selectedTopicId={selectedTopicId}
          isReadonly={isReadonly}
        />

        <Messages
          chatId={id}
          isLoading={isLoading}
          votes={votes}
          messages={messages}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
          isBlockVisible={isBlockVisible}
          addToolResult={addToolResult}
        />

        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          {!isReadonly && (

            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              append={append}
            />

          )}
        </form>
      </div>
      {/* The Block component is an integral part of the Chat component, and it is used to manage and display a specific section of the chat interface. */}
      <Block
        chatId={id}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        append={append}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
        votes={votes}
        isReadonly={isReadonly}
      />
    </ChatContext.Provider>
  );
}
