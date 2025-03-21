import React from "react";
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from "remark-gfm";
import Image from 'next/image';
import Link from 'next/link';
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
        pre: ({ children }) => <>{children}</>,
        ol: ({ node, children, ...props }) => {
            return (
                <ol className="list-decimal list-outside ml-4" {...props}>
                    {children}
                </ol>
            );
        },
        li: ({ node, children, ...props }) => {
            return (
                <li className="py-1" {...props}>
                    {children}
                </li>
            );
        },
        ul: ({ node, children, ...props }) => {
            return (
                <ul className="list-decimal list-outside ml-4" {...props}>
                    {children}
                </ul>
            );
        },
        strong: ({ node, children, ...props }) => {
            return (
                <span className="font-semibold" {...props}>
                    {children}
                </span>
            );
        },
        a: ({ node, children, ...props }) => {
            return (
                // @ts-expect-error
                <Link
                    className="text-blue-500 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                    {...props}
                >
                    {children}
                </Link>
            );
        },
        h1: ({ node, children, ...props }) => {
            return (
                <h1 className="text-3xl font-semibold mt-6 mb-2" {...props}>
                    {children}
                </h1>
            );
        },
        h2: ({ node, children, ...props }) => {
            return (
                <h2 className="text-2xl font-semibold mt-6 mb-2" {...props}>
                    {children}
                </h2>
            );
        },
        h3: ({ node, children, ...props }) => {
            return (
                <h3 className="text-xl font-semibold mt-6 mb-2" {...props}>
                    {children}
                </h3>
            );
        },
        h4: ({ node, children, ...props }) => {
            return (
                <h4 className="text-lg font-semibold mt-6 mb-2" {...props}>
                    {children}
                </h4>
            );
        },
        h5: ({ node, children, ...props }) => {
            return (
                <h5 className="text-base font-semibold mt-6 mb-2" {...props}>
                    {children}
                </h5>
            );
        },
        h6: ({ node, children, ...props }) => {
            return (
                <h6 className="text-sm font-semibold mt-6 mb-2" {...props}>
                    {children}
                </h6>
            );
        },
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

