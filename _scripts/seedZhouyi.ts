// npx tsx _scripts/seedZhouyi.ts
import { knowledge } from "@/lib/db/schemas/knowledgeBase";
import { TopicIds, type MarkdownSection, type ContentSection } from "@/lib/definitions";
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

function cleanContent(content: string): string {
  return content
    // Remove markdown bold
    .replace(/\*\*/g, '')
    // Remove extra whitespace
    .trim();
}

function parseContentSections(content: string): ContentSection[] {
  const sections: ContentSection[] = [];
  const lines = content.split('\n');
  let currentType = '原文';
  let currentContent: string[] = [];

  const addSection = () => {
    if (currentContent.length > 0) {
      sections.push({
        type: currentType,
        content: cleanContent(currentContent.join('\n'))
      });
      currentContent = [];
    }
  };

  for (const line of lines) {
    if (line.trim() === '') continue;

    // Check for section type changes
    if (line.includes('解释')) {
      addSection();
      currentType = '解释';
    } else if (line.includes('白话文解释')) {
      addSection();
      currentType = '白话文解释';
    } else if (line.includes('断易天机')) {
      addSection();
      currentType = '断易天机解';
    } else if (line.includes('邵雍解')) {
      addSection();
      currentType = '邵雍解';
    } else if (line.includes('傅佩荣解')) {
      addSection();
      currentType = '傅佩荣解';
    } else if (line.includes('传统解卦')) {
      addSection();
      currentType = '传统解卦';
    } else if (line.includes('变卦')) {
      addSection();
      currentType = '变卦';
    } else if (line.includes('哲学含义')) {
      addSection();
      currentType = '哲学含义';
    } else {
      currentContent.push(line);
    }
  }

  addSection();
  return sections;
}

function parseMarkdownToHierarchy(markdown: string): MarkdownSection[] {
  const lines = markdown.split('\n');
  const root: MarkdownSection[] = [];
  const stack: MarkdownSection[] = [];
  let currentSection: MarkdownSection | null = null;
  let contentLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

    if (headingMatch) {
      // Process content of previous section if it exists
      if (currentSection) {
        currentSection.sections = parseContentSections(contentLines.join('\n'));
        contentLines = [];
      }

      const level = headingMatch[1].length;
      const title = cleanContent(headingMatch[2]);
      const newSection: MarkdownSection = {
        title,
        level,
        sections: [],
        children: [],
      };

      // Pop sections from stack until we find a parent with lower level
      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      if (stack.length === 0) {
        // This is a top-level section
        root.push(newSection);
      } else {
        // Add as child to the last section in stack
        stack[stack.length - 1].children.push(newSection);
      }

      stack.push(newSection);
      currentSection = newSection;
    } else if (currentSection) {
      contentLines.push(line);
    }
  }

  // Process content of the last section
  if (currentSection && contentLines.length > 0) {
    currentSection.sections = parseContentSections(contentLines.join('\n'));
  }

  return root;
}

async function readMarkdownContent(filePath: string): Promise<MarkdownSection[]> {
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

    // Convert to hierarchical structure
    const hierarchy: MarkdownSection[] = parseMarkdownToHierarchy(processedContent);
    return hierarchy;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return [];
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
