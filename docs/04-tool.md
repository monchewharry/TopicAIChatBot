While large language models (LLMs) have incredible generation capabilities, they struggle with discrete tasks (e.g. mathematics) and interacting with the outside world (e.g. getting the weather).

Tools are actions that an LLM can invoke. The results of these actions can be reported back to the LLM to be considered in the next response.

For example, when you ask an LLM for the "weather in London", and there is a weather tool available, it could call a tool with London as the argument. The tool would then fetch the weather data and return it to the LLM. The LLM can then use this information in its response.

A tool consists of three properties:

- `description`: An optional description of the tool that can influence when the tool is picked.
- `parameters`: A Zod schema or a JSON schema that defines the parameters. The schema is consumed by the LLM, and also used to validate the LLM tool calls.
- `execute`: An optional async function that is called with the arguments from the tool call. It produces a value of type `RESULT` (generic type). It is optional because you might want to forward tool calls to the client or to a queue instead of executing them in the same process.


If the LLM decides to use a tool, it will generate a **tool call**. Tools with an execute function are run automatically when these calls are generated. The results of the tool calls are returned using **tool result** objects.

## Schemas

Schemas are used to define the parameters for tools and to validate the tool calls.

## Tool Calling

Let's create a React component that imports the `useChat` hook from the `@ai-sdk/react` module. The `useChat` hook will call the `/api/chat` endpoint when the user sends a message. The endpoint will generate the assistant's response based on the conversation history and stream it to the client. If the assistant responds with a tool call, the hook will automatically display them as well.

We will use the `maxSteps` to specify the maximum number of steps (i.e., LLM calls) that can be made to prevent infinite loops. In this example, you will set it to 2 to allow for two backend calls to happen.

```tsx title:app/page.tsx
'use client';

import { useChat } from '@ai-sdk/react';

export default function Page() {
  const { messages, input, setInput, append } = useChat({
    api: '/api/chat',
    maxSteps: 2,
  });

  return (
    <div>
      <input
        value={input}
        onChange={event => {
          setInput(event.target.value);
        }}
        onKeyDown={async event => {
          if (event.key === 'Enter') {
            append({ content: input, role: 'user' });
          }
        }}
      />

      {messages.map((message, index) => (
        <div key={index}>{message.content}</div>
      ))}
    </div>
  );
}
```

You will create a new route at `/api/chat` that will use the `streamText` function from the ai module to generate the assistant's response based on the conversation history.

You will use the tools parameter to specify a tool called `getWeather`.

You will also use `zod` to specify the schema for the `getWeather` function's parameters.

```tsx

import { ToolInvocation, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolInvocation[];
}

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    system: 'You are a helpful assistant.',
    messages,
    tools: {
      getWeather: {
        description: 'Get the weather for a location',
        parameters: z.object({
          city: z.string().describe('The city to get the weather for'),
          unit: z
            .enum(['C', 'F'])
            .describe('The unit to display the temperature in'),
        }),
        execute: async ({ city, unit }) => {
          const weather = {
            value: 24,
            description: 'Sunny',
          };

          return `It is currently ${weather.value}°${unit} and ${weather.description} in ${city}!`;
        },
      },
    },
  });

  return result.toDataStreamResponse();
}
```