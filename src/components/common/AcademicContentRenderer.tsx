import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';
import katex from 'katex';

interface AcademicContentRendererProps {
  content?: string | null;
  className?: string;
  isMono?: boolean;
}

/**
 * Renders mathematical expressions with KaTeX for both display ($$...$$) and inline ($...$) notation.
 */
function renderKaTeXEquations(htmlOrText: string): string {
  if (!htmlOrText) return '';

  // 1. Process display equations: $$...$$
  let processed = htmlOrText.replace(/\$\$([\s\S]+?)\$\$/g, (match, math) => {
    try {
      return `<div class="my-2 py-1 overflow-x-auto text-center">${katex.renderToString(math.trim(), {
        displayMode: true,
        throwOnError: false,
      })}</div>`;
    } catch {
      return match;
    }
  });

  // 2. Process inline equations: $...$ (ensuring no double-dollars or empty blocks)
  processed = processed.replace(/(?<!\$)\$([^\$\n\r]+?)\$(?!\$)/g, (match, math) => {
    try {
      return katex.renderToString(math.trim(), {
        displayMode: false,
        throwOnError: false,
      });
    } catch {
      return match;
    }
  });

  return processed;
}

/**
 * Checks whether content contains HTML tags (new Tiptap rich content)
 * or is legacy plain text.
 */
function hasHtmlMarkup(content: string): boolean {
  return /<\s*(p|div|h[1-6]|ul|ol|li|table|tbody|thead|tr|th|td|blockquote|pre|strong|b|em|i|u|img|span|br)[^>]*>/i.test(content);
}

/**
 * Escapes raw HTML characters in plain text to prevent injection
 * while preserving formatting.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const AcademicContentRenderer: React.FC<AcademicContentRendererProps> = ({
  content,
  className = '',
  isMono = false,
}) => {
  const renderedHtml = useMemo(() => {
    if (!content || !content.trim()) return '';

    const raw = content.trim();

    if (hasHtmlMarkup(raw)) {
      // 1. New rich content: Sanitize HTML with DOMPurify first
      const sanitized = DOMPurify.sanitize(raw, {
        ALLOWED_TAGS: [
          'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'strong', 'b', 'em', 'i', 'u', 's', 'strike',
          'ul', 'ol', 'li', 'blockquote',
          'table', 'thead', 'tbody', 'tr', 'th', 'td',
          'img', 'pre', 'code', 'br', 'span', 'sub', 'sup', 'div'
        ],
        ALLOWED_ATTR: [
          'src', 'alt', 'title', 'width', 'height',
          'class', 'style', 'colspan', 'rowspan', 'align'
        ],
        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
        ADD_ATTR: ['loading'],
      });

      // 2. Render KaTeX expressions inside the sanitized HTML
      return renderKaTeXEquations(sanitized);
    } else {
      // Legacy plain-text content: Escape HTML characters, preserve linebreaks
      const escaped = escapeHtml(raw);
      // Process any math formulas in legacy content
      const withMath = renderKaTeXEquations(escaped);
      // Convert newlines to breaks or paragraphs
      return withMath.replace(/\n/g, '<br />');
    }
  }, [content]);

  if (!renderedHtml) {
    return null;
  }

  return (
    <div
      className={`academic-content max-w-full overflow-x-auto ${isMono ? 'font-mono' : ''} ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};

export default AcademicContentRenderer;
