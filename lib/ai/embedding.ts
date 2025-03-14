import { embed, embedMany } from "ai";
import { and, cosineDistance, desc, gt, inArray, sql } from "drizzle-orm";
import { db } from "../db";
import { embeddings } from "../db/schemas/embeddings";
import { myProvider } from "./models";

const embeddingModel = myProvider.textEmbeddingModel('small-model');
// create chunks of resource materials
const generateChunks = (input: string): string[] => {
    return input
        .trim()
        .split(".")
        .filter((i) => i !== "");
};
// create content-embeddings of resource materials
export const generateEmbeddings = async (
    value: string,
): Promise<Array<{ embedding: number[]; content: string }>> => {
    const chunks = generateChunks(value);
    const { embeddings } = await embedMany({
        model: embeddingModel,
        values: chunks,
    });
    return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
};
// create one single embedding for one string
export const generateEmbedding = async (value: string): Promise<number[]> => {
    const input = value.replaceAll("\n", " ");
    const { embedding } = await embed({
        model: embeddingModel,
        value: input,
    });
    return embedding;
};

// similarity search
export const findRelevantContent = async (userQuery: string, fileIds: string[], top: number = 4) => {
    const userQueryEmbedded = await generateEmbedding(userQuery);

    const similarity = sql<number>`1 - (${cosineDistance(embeddings.embedding, userQueryEmbedded)})`;

    const similarGuides = await db
        .select({ content: embeddings.content, similarity })
        .from(embeddings)
        .where(and(
            gt(similarity, 0), // Filter by similarity > 0.3
            inArray(embeddings.resourceId, fileIds) // Filter by resourceId in fileIds
        ))
        .orderBy((t) => desc(t.similarity))
        .limit(top);
    return similarGuides;
};
