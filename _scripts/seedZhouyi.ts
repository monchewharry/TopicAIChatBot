// npx tsx _scripts/seedZhouyi.ts
import { knowledge } from "@/lib/db/schemas/knowledgeBase";
import { TopicIds } from "@/lib/definitions";
import { promises as fs } from "fs";
import path from "path";
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';

import { config } from 'dotenv';
config({
  path: '.env.local',
});

const client = postgres(process.env.POSTGRES_URL!, {
  ssl: 'require',
});
export const db = drizzle(client);
const ZHOUYI_DIR = path.join(process.cwd(), "_knowledge", "zhouyi");

async function readMarkdownContent(filePath: string): Promise<string> {
  try {
    const content = await fs.readFile(filePath, "utf-8");

    // Process the content
    const processedContent = content
      // Remove YAML frontmatter
      .replace(/^---\n[\s\S]*?\n---\n/, '')
      // Remove HTML table tags and their content
      .replace(/<table[\s\S]*?<\/table>/g, '')
      // Remove markdown image links
      .replace(/!\[.*?\]\(.*?\)/g, '')
      // Remove empty lines that might be left after removing content
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      // Trim any leading/trailing whitespace
      .trim();

    return processedContent;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return "";
  }
}

async function seedZhouyiKnowledge() {
  try {
    // Read all directories in the zhouyi folder
    const entries = await fs.readdir(ZHOUYI_DIR, { withFileTypes: true });

    for (const entry of entries) {
      // Skip .DS_Store and other hidden files
      if (entry.name.startsWith(".")) continue;

      const fullPath = path.join(ZHOUYI_DIR, entry.name);

      if (entry.isDirectory()) {
        // Read the index.md file in each directory
        const indexPath = path.join(fullPath, "index.md");
        const content = await readMarkdownContent(indexPath);
        const tree = `divination/${entry.name}`;

        if (content) {
          // Check if entry exists
          const existing = await db.select().from(knowledge).where(eq(knowledge.tree, tree));

          if (existing.length > 0) {
            // Update existing entry
            await db.update(knowledge)
              .set({
                content: content,
                updatedAt: new Date(),
              })
              .where(eq(knowledge.tree, tree));
            console.log(`Updated: ${entry.name}`);
          } else {
            // Insert new entry
            await db.insert(knowledge).values({
              topicId: TopicIds.divination,
              tree: tree,
              content: content,
            });
            console.log(`Created new: ${entry.name}`);
          }
        }
      } else if (entry.name === "index.md") {
        // Handle the root index.md file
        const content = await readMarkdownContent(fullPath);
        const tree = "divination/index";

        if (content) {
          // Check if root index exists
          const existing = await db.select().from(knowledge).where(eq(knowledge.tree, tree));

          if (existing.length > 0) {
            // Update existing entry
            await db.update(knowledge)
              .set({
                content: content,
                updatedAt: new Date(),
              })
              .where(eq(knowledge.tree, tree));
            console.log(`Updated: root index`);
          } else {
            // Insert new entry
            await db.insert(knowledge).values({
              topicId: TopicIds.divination,
              tree: tree,
              content: content,
            });
            console.log(`Created new: root index`);
          }
        }
      }
    }
    console.log("Seeding/updating completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seeding function
seedZhouyiKnowledge();
