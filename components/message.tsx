'use client';

import { useChatContext } from '@/context/chatContext';
import type { ChatRequestOptions, Message } from 'ai';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useState, } from 'react';

import type { Vote } from '@/lib/db/schemas/schema';

import { DocumentToolCall, DocumentToolResult } from '@/components/toolUI/document';
import {
  PencilEditIcon,
  SparklesIcon,
} from './icons';
import { Markdown } from './markdown';
import { MessageActions } from './message-actions';
import { PreviewAttachment } from './preview-attachment';
import { Weather } from '@/components/toolUI/weather';
import equal from 'fast-deep-equal';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { MessageEditor } from './message-editor';
import { DocumentPreview } from '@/components/toolUI/document-preview';
import { MessageReasoning } from './message-reasoning';
import { BaziDisplay } from './toolUI/natalChart/AstrolabeData';
import AstrolabeChart from './toolUI/natalChart/AstrolabeChart';
import type { DivinationInputs, NumerologyInputs } from '@/lib/definitions';
import Hexagram from './toolUI/zhouyi/hexagram';
import Result from './toolUI/zhouyi/result';
const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  reload,
  isReadonly,
  addToolResult
}: {
  chatId: string;
  message: Message;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  isReadonly: boolean;
  addToolResult?: ({ toolCallId, result, }: {
    toolCallId: string;
    result: any;
  }) => void
}) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const { topicInputValues } = useChatContext();
  return (
    <AnimatePresence>
      <motion.div
        className="w-full mx-auto max-w-3xl px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            'flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl',
            {
              'w-full': mode === 'edit',
              'group-data-[role=user]/message:w-fit': mode !== 'edit',
            },
          )}
        >
          {/* assistant message */}
          {message.role === 'assistant' && (
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
              <div className="translate-y-px">
                <SparklesIcon size={14} />
              </div>
            </div>
          )}


          <div className="flex flex-col gap-4 w-full">
            {/* attachment */}
            {message.experimental_attachments && (
              <div className="flex flex-row justify-end gap-2">
                {message.experimental_attachments.map((attachment) => (
                  <PreviewAttachment
                    key={attachment.url}
                    attachment={attachment}
                  />
                ))}
              </div>
            )}

            {/* reasoning text and status */}
            {message.reasoning && (
              <MessageReasoning
                isLoading={isLoading}
                reasoning={message.reasoning}
              />
            )}

            {/* user message View Mode and edit button*/}
            {(message.content || message.reasoning) && mode === 'view' && (

              <div className="flex flex-row gap-2 items-start">
                {message.role === 'user' && !isReadonly && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                        onClick={() => {
                          setMode('edit');
                        }}
                      >
                        <PencilEditIcon />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit message</TooltipContent>
                  </Tooltip>
                )}

                <div
                  className={cn('flex flex-col gap-4', {
                    'bg-primary text-primary-foreground px-3 py-2 rounded-xl':
                      message.role === 'user',
                  })}
                >
                  <Markdown>{message.content as string}</Markdown>
                </div>
              </div>
            )}

            {/* editing mode */}
            {message.content && mode === 'edit' && (
              <div className="flex flex-row gap-2 items-start">
                <div className="size-8" />

                <MessageEditor
                  key={message.id}
                  message={message}
                  setMode={setMode}
                  setMessages={setMessages}
                  reload={reload}
                />
              </div>
            )}

            {/* Tool Result */}
            {(message.toolInvocations && message.toolInvocations.length > 0) && (
              <div className="flex flex-col gap-4">

                {message.toolInvocations.map((toolInvocation) => {
                  const { toolName, toolCallId, state, args } = toolInvocation;
                  switch (toolName) {
                    case 'getBazi': {
                      switch (state) {
                        case 'call':
                          return (
                            <div
                              key={toolCallId}
                              className={cx({ skeleton: false })}
                            >
                              {null}
                            </div>
                          );
                        case 'result':
                          return (
                            <div key={toolCallId}>
                              <BaziDisplay
                                type="string"
                                chineseDate={toolInvocation.result}
                              />
                            </div>
                          );
                      }
                      break;
                    }
                    case 'getNatalChart': {
                      switch (state) {
                        case 'call':
                          return (
                            <div
                              key={toolCallId}
                              className={cx({ skeleton: false })}
                            >
                              {null}
                            </div>
                          );
                        case 'result': {
                          const inputs = topicInputValues as NumerologyInputs;
                          return (
                            <div key={toolCallId}>
                              <AstrolabeChart
                                birthday={inputs.solarDateStr}
                                birthTime={inputs.timeIndex}
                                birthdayType="solar"
                                gender={inputs.gender}
                                horoscopeDate={new Date()}
                                horoscopeHour={inputs.timeIndex}
                              />
                              <pre>{JSON.stringify(toolInvocation.result, null, 2)}</pre>
                              <p>Click the button below to view</p>
                            </div>
                          );
                        }
                      }
                      break;
                    }
                    case 'getDivination': {
                      switch (state) {
                        case 'call':
                          return (
                            <div
                              key={toolCallId}
                              className={cx({ skeleton: false })}
                            >
                              {null}
                            </div>
                          );
                        case 'result': {
                          const inputs = topicInputValues as DivinationInputs;
                          return (
                            <div key={toolCallId}>
                              <div className="flex max-w-md gap-2">
                                {inputs.currentHex && (
                                  <Hexagram list={inputs.currentHex} />
                                )}
                                {inputs.currentGua && (
                                  <div className="flex flex-col justify-around">
                                    <Result {...inputs.currentGua} />
                                  </div>
                                )}
                              </div>
                              <pre>{JSON.stringify(toolInvocation.result, null, 2)}</pre>
                              <p>Click the button below to view</p>
                            </div>
                          );
                        }
                      }
                      break;
                    }
                  }
                  // tool result ready
                  if (state === 'result') {
                    const { result } = toolInvocation;

                    return (
                      <div key={toolCallId}>
                        <p>{toolName} result:</p>
                        {toolName === 'getWeather' ? (
                          <Weather weatherAtLocation={result} />
                        ) : toolName === 'createDocument' ? (
                          <DocumentPreview
                            isReadonly={isReadonly}
                            result={result}
                          />
                        ) : toolName === 'updateDocument' ? (
                          <DocumentToolResult
                            type="update"
                            result={result}
                            isReadonly={isReadonly}
                          />
                        ) : toolName === 'requestSuggestions' ? (
                          <DocumentToolResult
                            type="request-suggestions"
                            result={result}
                            isReadonly={isReadonly}
                          />
                        ) : (
                          <pre>{JSON.stringify(result, null, 2)}</pre>
                        )}
                      </div>
                    );
                  };
                  // tool processing skeleton
                  return (
                    <div
                      key={toolCallId}
                      className={cx({
                        skeleton: ['getWeather'].includes(toolName),
                      })}
                    >
                      {toolName === 'getWeather' ? (
                        <Weather />
                      ) : toolName === 'createDocument' ? (
                        <DocumentPreview isReadonly={isReadonly} args={args} />
                      ) : toolName === 'updateDocument' ? (
                        <DocumentToolCall
                          type="update"
                          args={args}
                          isReadonly={isReadonly}
                        />
                      ) : toolName === 'requestSuggestions' ? (
                        <DocumentToolCall
                          type="request-suggestions"
                          args={args}
                          isReadonly={isReadonly}
                        />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}

            {!isReadonly && (
              <MessageActions
                key={`action-${message.id}`}
                chatId={chatId}
                message={message}
                vote={vote}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );

};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.reasoning !== nextProps.message.reasoning)
      return false;
    if (prevProps.message.content !== nextProps.message.content) return false;
    if (
      !equal(
        prevProps.message.toolInvocations,
        nextProps.message.toolInvocations,
      )
    )
      return false;
    if (!equal(prevProps.vote, nextProps.vote)) return false;

    return true;
  },
);

export const ThinkingMessage = () => {
  const role = 'assistant';

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message "
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          'flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl',
          {
            'group-data-[role=user]/message:bg-muted': true,
          },
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Thinking...
          </div>
        </div>
      </div>
    </motion.div>
  );
};
