import { TopicIds, type MarkdownSection } from "@/lib/definitions";
import { nanoid } from "@/lib/utils";
import { sql } from "drizzle-orm";
import { index, pgTable, text, timestamp, varchar, vector, json } from "drizzle-orm/pg-core";

export const knowledge = pgTable("knowledge", {
    id: varchar("id", { length: 191 })
        .primaryKey()
        .$defaultFn(() => nanoid()),
    topicId: varchar('topicId', { enum: Object.values(TopicIds) as [string, ...string[]] }) // the top category classify knowledge field
        .notNull()
        .default(TopicIds.general),
    tree: text("tree").notNull(), // the hierarchy tree of the knowledge content: science/math/algebra

    content: json().$type<MarkdownSection[]>(), //json style knowledge materials parsed from markdown
    createdAt: timestamp("created_at")
        .notNull()
        .default(sql`now()`),
    updatedAt: timestamp("updated_at")
        .notNull()
        .default(sql`now()`),
},);

export const embeddings = pgTable(
    "knowledgeEmbeddings",
    {
        id: varchar("id", { length: 191 })
            .primaryKey()
            .$defaultFn(() => nanoid()),
        knowledgeId: varchar("knowledge_id", { length: 191 })
            .references(
                () => knowledge.id,
                { onDelete: "cascade" },
            ),
        content: text("content").notNull(),
        embedding: vector("embedding", { dimensions: 1536 }).notNull(),
    },
    (t) => [
        index("knowledgeEmbeddingIndex").using(
            "hnsw",
            t.embedding.op("vector_cosine_ops"),
        )
    ],
);