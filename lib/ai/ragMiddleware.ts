import { auth } from "@/app/(auth)/auth";
import { findRelevantContent } from "./embedding";
import { openai } from "@ai-sdk/openai";
import {
    LanguageModelV1Middleware,
    generateObject,
    generateText
} from "ai";
import { z } from "zod";

// schema for validating the custom provider metadata
const selectionSchema = z.object({
    files: z.object({
        selection: z.array(z.string()),
    }),
});

// Transforms the parameters before they are passed to the language model.
export const ragMiddleware: LanguageModelV1Middleware = {
    transformParams: async ({ params }) => {
        const session = await auth();

        if (!session) return params; // no user session

        // The original parameters for the language model call. renames the extracted prompt property.
        const { prompt: messages, providerMetadata } = params;

        // validate the provider metadata with Zod:
        const { success, data } = selectionSchema.safeParse(providerMetadata);

        if (!success) return params;

        const selection = data.files.selection;

        if (selection.length == 0) return params;

        const recentMessage = messages.pop();

        if (!recentMessage || recentMessage.role !== "user") {
            if (recentMessage) {
                messages.push(recentMessage);
            }

            return params;
        }

        const lastUserMessageContent = recentMessage.content
            .filter((content) => content.type === "text")
            .map((content) => content.text)
            .join("\n");

        // Classify the user prompt as whether it requires more context or not
        const { object: classification } = await generateObject({
            // fast model for classification:
            model: openai("gpt-4o-mini", { structuredOutputs: true }),
            output: "enum",
            enum: ["question", "action", "statement", "other"],
            system: "classify the user message as a question, action, statement, or other",
            prompt: lastUserMessageContent,
        });

        // only use RAG for questions and action
        if (!["question", "action"].includes(classification)) {
            messages.push(recentMessage);
            return params;
        }

        // hypothetical answer will ask for the context
        const { text: hypotheticalAnswer } = await generateText({
            // fast model for generating hypothetical answer:
            model: openai("gpt-4o-mini", { structuredOutputs: true }),
            system: "Answer the users question:",
            prompt: lastUserMessageContent,
        });

        const topKContents = await findRelevantContent(hypotheticalAnswer, selection, 4)

        // add the chunks to the last user message
        messages.push({
            role: "user",
            content: [
                ...recentMessage.content,
                {
                    type: "text",
                    text: "Here is some relevant information and content that you can use to answer the question:",
                },
                ...topKContents.map((chunk) => ({
                    type: "text" as const,
                    text: chunk.content,
                })),
            ],
        });

        return { ...params, prompt: messages };
    },
};


// export const customModel = wrapLanguageModel({
//     model: openai("gpt-4o"),
//     middleware: ragMiddleware,
// });
