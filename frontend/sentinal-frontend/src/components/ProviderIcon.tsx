import React from 'react';

interface ProviderIconProps {
  provider?: string;
  name?: string;
  className?: string;
  size?: number;
}

export const ProviderIcon: React.FC<ProviderIconProps> = ({ 
  provider = '', 
  name = '', 
  className = 'w-4 h-4',
  size = 16 
}) => {
  const lowerP = (provider || '').toLowerCase();
  const lowerN = (name || '').toLowerCase();

  // Anthropic / Claude
  if (lowerP.includes('anthropic') || lowerN.includes('claude') || lowerN.includes('sonnet') || lowerN.includes('haiku') || lowerN.includes('opus')) {
    return (
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={`text-[#d97706] flex-shrink-0 ${className}`}
      >
        <path d="M14.5 3h-5L4 21h4.8l1.3-4.2h7.8l1.3 4.2H24L18.5 3h-4zm-3.1 10.4 2.6-8.2 2.6 8.2h-5.2z" />
      </svg>
    );
  }

  // OpenAI / ChatGPT
  if (lowerP.includes('openai') || lowerN.includes('gpt') || lowerN.includes('o1') || lowerN.includes('o3') || lowerN.includes('chatgpt')) {
    return (
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={`text-[#10a37f] flex-shrink-0 ${className}`}
      >
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1683a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4947zm-9.208-4.4947a4.4707 4.4707 0 0 1-.5346-3.0037l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-5.6881-2.0157zm-1.859-9.155a4.4707 4.4707 0 0 1 2.3418-1.963l-.142.0852v5.5164a.7948.7948 0 0 0 .3928.6813l5.838 3.3685-2.02 1.1683a.071.071 0 0 1-.0663.0047L4.71 14.0727a4.504 4.504 0 0 1-2.5171-5.2932zm16.5806 3.6053-5.838-3.3732 2.02-1.1683a.071.071 0 0 1 .0663-.0047l4.8906 2.8252a4.504 4.504 0 0 1 1.4857 5.7331 4.4755 4.4755 0 0 1-2.6246 1.9867v-5.9988a.7948.7948 0 0 0-.3928-.6813zm2.465-3.3685-.142-.0852-4.783-2.7582a.7712.7712 0 0 0-.7806 0L8.892 7.0267V4.6943a.0804.0804 0 0 1 .0332-.0615l4.8906-2.8252a4.4992 4.4992 0 0 1 5.6881 2.0157 4.4707 4.4707 0 0 1 .5346 3.0037zM8.3072 12.868l-2.02-1.1636a.0804.0804 0 0 1-.038-.0568V6.065a4.4992 4.4992 0 0 1 4.4945-4.4947c.9986 0 1.9686.336 2.7582.9513l-.1419.0804-4.783 2.7582a.7948.7948 0 0 0-.3928.6813v6.7369zm1.0979-2.2285 2.595-1.4984 2.595 1.4984v2.9968l-2.595 1.4984-2.595-1.4984z" />
      </svg>
    );
  }

  // Google / Gemini
  if (lowerP.includes('google') || lowerN.includes('gemini') || lowerN.includes('summarize')) {
    return (
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        className={`flex-shrink-0 ${className}`}
      >
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
      </svg>
    );
  }

  // xAI / Grok
  if (lowerP.includes('xai') || lowerN.includes('grok') || lowerN.includes('weekend') || lowerN.includes('x-ai')) {
    return (
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={`text-zinc-200 flex-shrink-0 ${className}`}
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }

  // Mistral
  if (lowerP.includes('mistral') || lowerN.includes('mistral') || lowerN.includes('sql')) {
    return (
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={`text-[#ff7000] flex-shrink-0 ${className}`}
      >
        <path d="M3 4h3.5v3.5H3V4zm14.5 0H21v3.5h-3.5V4zM3 7.5h7V11H3V7.5zm10.5 0h7.5V11h-7.5V7.5zM3 11h18v3.5H3V11zm0 3.5h7V18H3v-3.5zm10.5 0h7.5V18h-7.5v-3.5zM3 18h3.5v3.5H3V18zm14.5 0H21v3.5h-3.5V18z" />
      </svg>
    );
  }

  // DeepSeek / Ollama / Local
  if (lowerP.includes('ollama') || lowerN.includes('deepseek') || lowerN.includes('optimize') || lowerN.includes('llama')) {
    return (
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={`text-[#3b82f6] flex-shrink-0 ${className}`}
      >
        <path d="M12 2a8 8 0 0 0-8 8c0 3.5 2.2 6.5 5.5 7.6V20a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-2.4c3.3-1.1 5.5-4.1 5.5-7.6a8 8 0 0 0-8-8z" />
        <path d="M9 10h.01" />
        <path d="M15 10h.01" />
      </svg>
    );
  }

  // Default: Sentinel Glowing Feather (Cyan to Violet)
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      className={`flex-shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id="sentinel-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <path 
        d="M26 6C26 6 18 8 13 14C8 20 6 26 6 26C6 26 12 25 18 20C23 15 26 6 26 6Z" 
        fill="url(#sentinel-grad)" 
      />
      <path 
        d="M13 14C11 16 9.5 19 8.5 22.5C11 20 14 17.5 17 15.5" 
        stroke="#ffffff" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        opacity="0.8" 
      />
    </svg>
  );
};
