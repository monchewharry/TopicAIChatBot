'use client';
import { useChatContext } from '@/context/chatContext';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { memo } from 'react';
import { type TopicInputs, TopicIds } from '@/lib/definitions'
import { birthTimeOptions } from '@/lib/toolData/chineseTimeLabel';
import type { ChatRequestOptions, CreateMessage, Message } from 'ai';

interface BasicSuggestedActionsProps {
  chatId: string;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
}
// the suggested action should not trigger client side tool action, o.s. it will read the context values to default.
function PureSuggestedActions({ chatId, append }: BasicSuggestedActionsProps) {
  const { topicInputValues } = useChatContext();
  const suggestedActions = getSuggestedActionsByTopic(topicInputValues);

  return (
    <div className="grid sm:grid-cols-2 gap-2 w-full">
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className={index > 1 ? 'hidden sm:block' : 'block'}
        >
          <SendButton chatId={chatId} append={append} suggestedAction={suggestedAction} />
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Get suggested actions based on the TopicInputs
 * @param topicInputs 
 * @returns 
 */
function getSuggestedActionsByTopic(topicInputs: TopicInputs) {
  const defaultSuggestedActions = [
    {
      title: 'Write code to',
      label: `demonstrate djikstra's algorithm`,
      action: `Write code to demonstrate djikstra's algorithm`,
    },
    {
      title: 'Help me write an essay',
      label: `about silicon valley`,
      action: `Help me write an essay about silicon valley`,
    },
    {
      title: 'What is the weather',
      label: 'in San Francisco?',
      action: 'What is the weather in San Francisco?',
    },
  ];

  switch (topicInputs.topicId) {
    case TopicIds.numerology: {

      return [
        {
          title: '四柱八字?',
          label: `${topicInputs.solarDateStr} ${birthTimeOptions.find(option => option.value === topicInputs.timeIndex)?.label}`,
          action: 'get bazi'
        },
        {
          title: '紫微斗数排盘?',
          label: `${topicInputs.solarDateStr} ${birthTimeOptions.find(option => option.value === topicInputs.timeIndex)?.label}`,
          action: 'get natal chart',
        },
      ];
    }
    case TopicIds.divination: {

      return [
        {
          title: `${topicInputs.currentGua?.guaResult ?? ""}的含义`,
          label: '周易',
          action: `${topicInputs.currentGua?.guaResult ?? ""}的含义`,
        },
        {
          title: 'divination title',
          label: `divination label`,
          action: `divination action`,
        },
      ];
    }
    case TopicIds.general:
      return defaultSuggestedActions;
  }
}


export const SuggestedActions = memo(
  PureSuggestedActions,
  // never rerender
  () => true
);


function PureSendButton({
  chatId,
  append,
  suggestedAction,
}: {
  chatId: string;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  suggestedAction: {
    title: string;
    label: string;
    action: string;
  };

}) {
  return (
    <Button
      variant="ghost"
      onClick={async () => {
        // setInput(suggestedAction.action);
        // submitForm();
        window.history.replaceState({}, '', `/chat/${chatId}`);

        append({
          role: 'user',
          content: suggestedAction.action,
        });
      }}
      className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start"
    >
      <span className="font-medium">{suggestedAction.title}</span>
      <span className="text-muted-foreground">
        {suggestedAction.label}
      </span>
    </Button>
  );
}

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  if (prevProps.suggestedAction !== nextProps.suggestedAction) return false;
  return true;
});