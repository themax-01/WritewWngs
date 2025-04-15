import { FC } from "react";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkGithub from "remark-github";
import rehypeRaw from "rehype-raw";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MarkdownProps {
  content: string;
  className?: string;
}

export const Markdown: FC<MarkdownProps> = ({ content, className = "" }) => {
  return (
    <div className={`prose dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks, [remarkGithub, { repository: "https://github.com/pencraft/platform" }]]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter
                style={atomDark}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          // Add responsive styling to tables
          table({ node, ...props }) {
            return (
              <div className="overflow-x-auto">
                <table {...props} />
              </div>
            );
          },
          // Make images responsive
          img({ node, ...props }) {
            return (
              <img
                className="rounded-md max-w-full h-auto"
                {...props}
                loading="lazy"
              />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default Markdown;
