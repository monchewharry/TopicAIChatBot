// npx tsx _scripts/seedNatalChart.ts
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
const NATAL_CHART_DIR = path.join(process.cwd(), "_knowledge", "natalChart");

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
  let currentType = '概述';
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

    // Check for section type changes based on natal chart content structure
    if (line.includes('基本概念')) {
      addSection();
      currentType = '基本概念';
    } else if (line.includes('详细解释')) {
      addSection();
      currentType = '详细解释';
    } else if (line.includes('实践应用')) {
      addSection();
      currentType = '实践应用';
    } else if (line.includes('注意事项')) {
      addSection();
      currentType = '注意事项';
    } else if (line.includes('参考资料')) {
      addSection();
      currentType = '参考资料';
    } else if (line.includes('问答')) {
      addSection();
      currentType = '问答';
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
      // Remove YAML frontmatter and standalone --- lines
      .replace(/^---\n[\s\S]*?\n---\n/, '')
      .replace(/^\s*---+\s*$/gm, '')
      // Remove HTML elements and their content
      .replace(/<table[\s\S]*?<\/table>/g, '')
      .replace(/<script[\s\S]*?<\/script>/g, '')
      // Remove self-closing tags with attributes
      .replace(/<[a-zA-Z]+[^>]*?\/>/g, '')
      // Remove markdown image links ![]()
      .replace(/!\[.*?\]\(.*?\)/g, '')
      // Remove blockquotes with copyright notices
      .replace(/>\s*\*.*?原创文章.*?\*/g, '')
      // Remove tip blocks
      // .replace(/:::tip[\s\S]*?:::/g, '')
      // Remove remaining blockquotes
      // .replace(/>\s*[^\n]+/g, '')
      // Remove extra newlines
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // Convert to hierarchical structure
    const hierarchy: MarkdownSection[] = parseMarkdownToHierarchy(processedContent);
    return hierarchy;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return [];
  }
}

async function seedNatalChartKnowledge() {
  try {
    // Read all markdown files in the natal chart folder
    const entries = await fs.readdir(NATAL_CHART_DIR, { withFileTypes: true });

    for (const entry of entries) {
      // Skip non-markdown files and hidden files
      if (!entry.name.endsWith('.md') || entry.name.startsWith('.')) continue;

      const fullPath = path.join(NATAL_CHART_DIR, entry.name);
      const content = await readMarkdownContent(fullPath);
      // Use the filename without extension as the tree path
      const tree = `natalChart/${entry.name.replace('.md', '')}`;

      if (content.length > 0) {
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
            topicId: TopicIds.numerology,
            tree: tree,
            content: content,
          });
          console.log(`Created new: ${entry.name}`);
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
seedNatalChartKnowledge();
