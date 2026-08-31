import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Terminal, FileCode, CheckCheck } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`prose-container text-[15px] leading-relaxed break-words ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !String(children).includes('\n');
            const codeString = String(children).replace(/\n$/, '');

            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-zinc-800/80 text-rose-300 font-mono text-[13px] border border-zinc-700/50"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            const language = match ? match[1] : 'text';
            return (
              <CodeBlock language={language} value={codeString} />
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4 rounded-lg border border-zinc-700/70">
                <table className="min-w-full divide-y divide-zinc-700 text-left text-sm">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-zinc-800/70 font-semibold text-zinc-200">{children}</thead>;
          },
          tbody({ children }) {
            return <tbody className="divide-y divide-zinc-800/50 bg-zinc-900/40 text-zinc-300">{children}</tbody>;
          },
          th({ children }) {
            return <th className="px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider">{children}</th>;
          },
          td({ children }) {
            return <td className="px-3.5 py-2 text-sm">{children}</td>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-rose-500/60 pl-4 py-1 my-3 text-zinc-300 italic bg-rose-950/10 rounded-r-lg">
                {children}
              </blockquote>
            );
          },
          h1({ children }) {
            return <h1 className="text-xl sm:text-2xl font-bold text-white mt-6 mb-3 tracking-tight font-heading">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-lg sm:text-xl font-bold text-white mt-5 mb-2.5 tracking-tight font-heading">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-base sm:text-lg font-semibold text-zinc-100 mt-4 mb-2 font-heading">{children}</h3>;
          },
          h4({ children }) {
            return <h4 className="text-sm sm:text-base font-semibold text-zinc-200 mt-3 mb-1.5">{children}</h4>;
          },
          ul({ children }) {
            return <ul className="list-disc list-outside pl-5 space-y-1.5 my-2.5 text-zinc-200">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-outside pl-5 space-y-1.5 my-2.5 text-zinc-200">{children}</ol>;
          },
          li({ children }) {
            return <li className="pl-0.5">{children}</li>;
          },
          p({ children }) {
            return <p className="my-2.5 leading-relaxed text-zinc-200">{children}</p>;
          },
          hr() {
            return <hr className="my-5 border-zinc-800" />;
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-rose-400 hover:text-rose-300 underline underline-offset-2 transition-colors font-medium"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

interface CodeBlockProps {
  language: string;
  value: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const lines = value.split('\n');

  return (
    <div className="relative my-4 rounded-xl overflow-hidden border border-zinc-800 bg-[#0d0e12] shadow-xl group">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#16181f] border-b border-zinc-800/80 text-xs text-zinc-400 select-none">
        <div className="flex items-center space-x-2">
          <FileCode className="w-3.5 h-3.5 text-rose-400" />
          <span className="font-mono text-xs uppercase tracking-wider font-semibold text-zinc-300">
            {language}
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-[11px] text-zinc-500 font-mono">{lines.length} lines</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            className="px-2 py-0.5 rounded text-[11px] hover:bg-zinc-700/50 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Toggle line numbers"
          >
            {showLineNumbers ? 'Hide #' : 'Show #'}
          </button>
          
          <button
            type="button"
            id={`copy-code-${language}-${Math.random().toString(36).substring(2, 6)}`}
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors text-xs font-medium"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className="p-4 overflow-x-auto font-mono text-[13.5px] leading-relaxed text-zinc-200">
        <pre className="m-0 flex">
          {showLineNumbers && (
            <div className="select-none pr-4 text-right text-zinc-600 border-r border-zinc-800/80 mr-4 font-mono text-[12px] min-w-[2.2rem]">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
          )}
          <code className="flex-1 font-mono text-zinc-100 whitespace-pre">
            {value}
          </code>
        </pre>
      </div>
    </div>
  );
};
