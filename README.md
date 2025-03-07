# multi-modal+RAG ai chatbot for Topic with tools
<!-- TOC -->

- [multi-modal+RAG ai chatbot for Topic with tools](#multi-modalrag-ai-chatbot-for-topic-with-tools)
  - [Dev Note](#dev-note)
    - [domain/topic knowledge RAG](#domaintopic-knowledge-rag)
    - [DataBase](#database)
    - [API Routes](#api-routes)
      - [chat](#chat)
    - [Chat UI](#chat-ui)
    - [Tool](#tool)
      - [Client Tools inspired by those authors](#client-tools-inspired-by-those-authors)
      - [Server tools](#server-tools)
    - [vscode editor setting](#vscode-editor-setting)
    - [structure](#structure)
  - [Features](#features)
  - [Model Providers](#model-providers)
  - [Deploy Your Own](#deploy-your-own)
  - [Running locally](#running-locally)

<!-- /TOC -->

## Dev Note  

### domain/topic knowledge RAG

- resources
  - user chat attachment 
  - database domain/topic knowledge base
- indexing
  - from RAW markdown to JSON. (`_scripts`)
  - leverage obsidian community plugin dataviewjs
  - embedding database storage (postgres vector plugin)

### DataBase

- Table Schema: `schema.ts`
- Save Chat
  - Response message: assistant messages, server tool call and result,
  - Request message: user message, client tool result,

> [!NOTE] 
> Save Client side Tool's result message from request message
> The client side tool's `tool-call` is in assistant response message, while `too-result` will be in the next assistant request message if user send more questions upon the tool's result.  
> And message id are the same for the two assistant message (`onToolCall`). So when saving the two message to the database, we need to generate a new message id for the `tool-result`.

### API Routes

- Request/Response for `steamText()` at `\app\(chat)\api\chat`
  - update chat saving logic to include topic metadata
- Sent attachment along with message at `\app\(chat)\api\files\upload` and store the file in Blob Store (Only images and not RAG).
  - expand `allowedFileTypes` to include document attachment as user end RAG resource.

Not touched:  
- get Chats By UserId at `\app\(chat)\api\history`
- user rating at `\app\(chat)\api\vote`
- Block Document at `\app\(chat)\api\document`



#### chat

- `/app/api/chat/route.ts`

> [!NOTE] 
> sendExtraMessageFields
> when enable `sendExtraMessageFields: true` in `useChat`, extra fields like `id`, `createdAt` will be added to the `message`. Especially, the assistant role message might be added with the `revisionId`.

### Chat UI

- Display Message from interactive session
- Display Message from DataBase
- Chat Header: Model Selection, Topic Selection
- Chat TopicInputValues
- Suggest Action: `append`

### Tool

- Server side tool: `execute:`
- Client side tool: `onToolCall`


> [!NOTE] 
> `onToolCall` triggered by `append`
> The `onToolCall` function uses `topicInputValues` directly, but because `onToolCall` is passed to the `useChat` hook, it does not automatically update when `topicInputValues` changes due to React’s closure behavior.

Originally version (issue)

```tsx title:chat.tsx
const [topicInputValues, setTopicInputValues] = useState<TopicInputs>(() => {....});

async function onToolCall(
  { toolCall }: { toolCall: ToolCall<string, unknown> }
): Promise<string | undefined | NatalChartDataOriginal[]> {

  if (topicInputValues.topicId === 'topic-numerology') {
    console.log('topicInputValues.solarDateStr', topicInputValues.solarDateStr);
    const astrolabeData = bySolar(
      topicInputValues.solarDateStr,
      topicInputValues.timeIndex,
      topicInputValues.gender
    );
    ...
  }
};
```

Fixed version (Use `useRef` to Track State Changes)

```tsx title:chat.tsx
const [topicInputValues, setTopicInputValues] = useState<TopicInputs>(() => {....});
const topicInputValuesRef = useRef(topicInputValues);

useEffect(() => {
  topicInputValuesRef.current = topicInputValues;
}, [topicInputValues]);

async function onToolCall(
  { toolCall }: { toolCall: ToolCall<string, unknown> }
): Promise<string | undefined | NatalChartDataOriginal[]> {
  const currentTopicInputValues = topicInputValuesRef.current; // Get the latest value

  if (currentTopicInputValues.topicId === 'topic-numerology') {
    console.log('topicInputValues.solarDateStr', currentTopicInputValues.solarDateStr);
    const astrolabeData = bySolar(
      currentTopicInputValues.solarDateStr,
      currentTopicInputValues.timeIndex,
      currentTopicInputValues.gender
    );
    ...
  }
};
```

#### Client Tools inspired by those authors

- bazi feature
  - [lunar-lite](https://github.com/SylarLong/lunar-lite.git) 
  - [iztro](https://github.com/SylarLong/iztro.git)
- natal chart feature
  - [SylarLong/react-iztro](https://github.com/SylarLong/react-iztro.git)
- zhouyi feature
  - [app sunls24/divination](https://github.com/sunls24/divination)
    - [knowledge docs](https://github.com/sunls2/zhouyi)
  - [JS Humoonruc/auto-divination](https://github.com/Humoonruc/auto-divination)
  - [JS douxt/divination](https://github.com/douxt/divination)

#### Server tools

- weather
- coding
- document editing

### vscode editor setting

```json
// .vscode/settings.json
{
    // mute tailwind unknownAtRules warning 
    "files.associations": {
        "*.css": "tailwindcss"
    }
}
```

### structure

`tree -L 4 --gitignore`

---
Following is from the original template's README.

## Features

- [Next.js](https://nextjs.org) App Router
  - Advanced routing for seamless navigation and performance
  - React Server Components (RSCs) and Server Actions for server-side rendering and increased performance
- [AI SDK](https://sdk.vercel.ai/docs)
  - Unified API for generating text, structured objects, and tool calls with LLMs
  - Hooks for building dynamic chat and generative user interfaces
  - Supports OpenAI (default), Anthropic, Cohere, and other model providers
- [shadcn/ui](https://ui.shadcn.com)
  - Styling with [Tailwind CSS](https://tailwindcss.com)
  - Component primitives from [Radix UI](https://radix-ui.com) for accessibility and flexibility
- Data Persistence
  - [Vercel Postgres powered by Neon](https://vercel.com/storage/postgres) for saving chat history and user data
  - [Vercel Blob](https://vercel.com/storage/blob) for efficient file storage
- [NextAuth.js](https://github.com/nextauthjs/next-auth)
  - Simple and secure authentication

## Model Providers

This template ships with OpenAI `gpt-4o` as the default. However, with the [AI SDK](https://sdk.vercel.ai/docs), you can switch LLM providers to [OpenAI](https://openai.com), [Anthropic](https://anthropic.com), [Cohere](https://cohere.com/), and [many more](https://sdk.vercel.ai/providers/ai-sdk-providers) with just a few lines of code.

## Deploy Your Own

You can deploy your own version of the Next.js AI Chatbot to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fai-chatbot&env=AUTH_SECRET,OPENAI_API_KEY&envDescription=Learn%20more%20about%20how%20to%20get%20the%20API%20Keys%20for%20the%20application&envLink=https%3A%2F%2Fgithub.com%2Fvercel%2Fai-chatbot%2Fblob%2Fmain%2F.env.example&demo-title=AI%20Chatbot&demo-description=An%20Open-Source%20AI%20Chatbot%20Template%20Built%20With%20Next.js%20and%20the%20AI%20SDK%20by%20Vercel.&demo-url=https%3A%2F%2Fchat.vercel.ai&stores=[{%22type%22:%22postgres%22},{%22type%22:%22blob%22}])

## Running locally

You will need to use the environment variables [defined in `.env.example`](.env.example) to run Next.js AI Chatbot. It's recommended you use [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables) for this, but a `.env` file is all that is necessary.

> Note: You should not commit your `.env` file or it will expose secrets that will allow others to control access to your various OpenAI and authentication provider accounts.

1. Install Vercel CLI: `npm i -g vercel`
2. Link local instance with Vercel and GitHub accounts (creates `.vercel` directory): `vercel link`
3. Download your environment variables: `vercel env pull`

```bash
pnpm install
pnpm dev
```

Your app template should now be running on [localhost:3000](http://localhost:3000/).




> [!NOTE]  
> Highlights information that users should take into account, even when skimming.

> [!TIP]
> Optional information to help a user be more successful.

> [!IMPORTANT]  
> Crucial information necessary for users to succeed.

> [!WARNING]  
> Critical content demanding immediate user attention due to potential risks.

> [!CAUTION]
> Negative potential consequences of an action.
