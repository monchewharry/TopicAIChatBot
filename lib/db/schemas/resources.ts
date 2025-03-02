import { sql, relations } from "drizzle-orm";
import { text, varchar, uuid, timestamp, pgTable } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { nanoid } from "@/lib/utils";
import { chat } from "./schema";
export const resources = pgTable("resources", {
    id: varchar("id", { length: 191 })
        .primaryKey()
        .$defaultFn(() => nanoid()),
    content: text("content").notNull(),
    createdAt: timestamp("created_at")
        .notNull()
        .default(sql`now()`),
    updatedAt: timestamp("updated_at")
        .notNull()
        .default(sql`now()`),
    chatId: uuid('chatId')
        .notNull()
        .references(() => chat.id, { onDelete: 'cascade' }),
});

// // resources chat relations
// export const chatRelations = relations(chat, ({ many }) => ({
//     resources: many(resources),
// }));
// export const resourcesRelations = relations(resources, ({ one }) => ({
//     chat: one(chat, {
//         fields: [resources.chatId],
//         references: [chat.id],
//     }),
// }));

// Schema for resources - used to validate API requests
export const insertResourceSchema = createSelectSchema(resources)
    .extend({})
    .omit({
        createdAt: true,
        updatedAt: true,
        // chatId: true,
    });

// Type for resources - used to type API request params and within Components
export type NewResourceParams = z.infer<typeof insertResourceSchema>;
