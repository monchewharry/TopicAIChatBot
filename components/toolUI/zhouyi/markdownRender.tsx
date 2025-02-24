import React from "react";
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from "remark-gfm";
import Image from 'next/image';
import rehypeRaw from "rehype-raw";
interface MarkdownRendererProps {
    content: string;
    markdownDir: string; // Pass the directory where the markdown file is located "/path/to/docs";
}

export const ZhouyiMarkdownRenderer = ({ content, markdownDir }: MarkdownRendererProps) => {
    // solve relative image source url
    const components: Partial<Components> = {
        // Handle <img> tags inside <td> and other elements
        img: ({ src, alt }) => {
            let resolvedSrc = src || "";

            if (resolvedSrc && !resolvedSrc.startsWith("http")) {
                // Resolve relative image paths based on markdownDir
                resolvedSrc = `${markdownDir}/${resolvedSrc}`;
            }

            // Handle width and height for images
            const width = 200; // Default width or dynamically adjust
            const height = 200; // Default height or dynamically adjust

            return <Image src={resolvedSrc} alt={alt || "image"} width={width} height={height} />;
        },
        // Handle table rows, ensuring correct rendering of <td> and images within them
        table: ({ children }) => (
            <table className="markdown-table">{children}</table>
        ),
        tr: ({ children }) => <tr className="markdown-table-row">{children}</tr>,
        td: ({ children }) => (
            <td className="markdown-table-cell">
                {children}
            </td>
        ),
    }
    return (
        <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm]}
            components={components}
        >
            {content}
        </ReactMarkdown>
    );
};

