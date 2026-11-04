import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table';
import Image from '@tiptap/extension-image';
import katex from 'katex';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo2,
  Redo2,
  Table as TableIcon,
  Plus,
  Minus,
  Trash2,
  Image as ImageIcon,
  Sigma,
  X,
  Check,
} from 'lucide-react';

interface AcademicRichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  label?: string;
  helperText?: string;
  compact?: boolean;
}

export const AcademicRichEditor: React.FC<AcademicRichEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write academic content here...',
  minHeight = '140px',
  label,
  helperText,
  compact = false,
}) => {
  // Modal states for Image & Math Insertion
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');

  const [showMathModal, setShowMathModal] = useState(false);
  const [mathFormula, setMathFormula] = useState('\\frac{a}{b}');
  const [isDisplayMath, setIsDisplayMath] = useState(false);
  const [mathPreviewError, setMathPreviewError] = useState<string | null>(null);

  // Table options dropdown
  const [showTableMenu, setShowTableMenu] = useState(false);
  const tableMenuRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Underline,
      Table.configure({
        resizable: false,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: `focus:outline-none px-3.5 py-3 text-slate-800 text-xs sm:text-sm leading-relaxed`,
        style: `min-height: ${minHeight};`,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // If editor is empty (e.g. just <p></p>), normalize to empty string
      if (html === '<p></p>' || editor.isEmpty) {
        onChange('');
      } else {
        onChange(html);
      }
    },
  });

  // Synchronize outside value updates (e.g. form reset or question selection)
  useEffect(() => {
    if (!editor) return;

    const currentHtml = editor.getHTML();
    const normalizedValue = value || '';

    // Only update if genuinely different to preserve cursor and avoid infinite loops
    if (normalizedValue === '' && !editor.isEmpty) {
      editor.commands.setContent('', { emitUpdate: false });
    } else if (normalizedValue && normalizedValue !== currentHtml) {
      editor.commands.setContent(normalizedValue, { emitUpdate: false });
    }
  }, [value, editor]);

  // Close table dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tableMenuRef.current && !tableMenuRef.current.contains(event.target as Node)) {
        setShowTableMenu(false);
      }
    }
    if (showTableMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showTableMenu]);

  // Insert image handler
  const handleInsertImage = () => {
    if (!imageUrl.trim() || !editor) return;
    editor.chain().focus().setImage({
      src: imageUrl.trim(),
      alt: imageAlt.trim() || 'Academic Diagram',
    }).run();
    setImageUrl('');
    setImageAlt('');
    setShowImageModal(false);
  };

  // Insert math formula handler
  const handleInsertMath = () => {
    if (!mathFormula.trim() || !editor) return;
    const delimiter = isDisplayMath ? '$$' : '$';
    const equationText = `${delimiter}${mathFormula.trim()}${delimiter}`;
    editor.chain().focus().insertContent(` ${equationText} `).run();
    setMathFormula('\\frac{a}{b}');
    setShowMathModal(false);
  };

  // Render live KaTeX preview in modal
  const renderMathPreview = () => {
    try {
      return (
        <div
          className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center overflow-x-auto my-2"
          dangerouslySetInnerHTML={{
            __html: katex.renderToString(mathFormula.trim() || 'x', {
              displayMode: isDisplayMath,
              throwOnError: false,
            }),
          }}
        />
      );
    } catch (err: any) {
      return (
        <div className="p-2 text-xs text-rose-600 bg-rose-50 rounded-xl border border-rose-200">
          Invalid LaTeX formula: {err?.message || 'Syntax error'}
        </div>
      );
    }
  };

  if (!editor) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-4 text-xs text-slate-400">
        Loading rich editor...
      </div>
    );
  }

  const isTableActive = editor.isActive('table');

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-[11px] font-bold text-slate-700">{label}</label>
          {helperText && <span className="text-[10px] text-slate-400">{helperText}</span>}
        </div>
      )}

      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-xs focus-within:border-syllabo-900/50 focus-within:ring-1 focus-within:ring-syllabo-900/20 transition-all">
        {/* Editor Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-1.5 bg-stone-50/80 border-b border-stone-200 text-xs select-none">
          {/* Bold */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-lg hover:bg-stone-200/80 transition-colors ${
              editor.isActive('bold') ? 'bg-syllabo-900 text-white hover:bg-syllabo-800' : 'text-slate-700'
            }`}
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-lg hover:bg-stone-200/80 transition-colors ${
              editor.isActive('italic') ? 'bg-syllabo-900 text-white hover:bg-syllabo-800' : 'text-slate-700'
            }`}
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          {/* Underline */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded-lg hover:bg-stone-200/80 transition-colors ${
              editor.isActive('underline') ? 'bg-syllabo-900 text-white hover:bg-syllabo-800' : 'text-slate-700'
            }`}
            title="Underline"
          >
            <UnderlineIcon className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-stone-300 mx-0.5" />

          {/* Heading 2 */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded-lg hover:bg-stone-200/80 transition-colors ${
              editor.isActive('heading', { level: 2 })
                ? 'bg-syllabo-900 text-white hover:bg-syllabo-800'
                : 'text-slate-700'
            }`}
            title="Section Heading (H2)"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>

          {/* Heading 3 */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1.5 rounded-lg hover:bg-stone-200/80 transition-colors ${
              editor.isActive('heading', { level: 3 })
                ? 'bg-syllabo-900 text-white hover:bg-syllabo-800'
                : 'text-slate-700'
            }`}
            title="Subheading (H3)"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-stone-300 mx-0.5" />

          {/* Bullet List */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded-lg hover:bg-stone-200/80 transition-colors ${
              editor.isActive('bulletList')
                ? 'bg-syllabo-900 text-white hover:bg-syllabo-800'
                : 'text-slate-700'
            }`}
            title="Bullet Points"
          >
            <List className="w-3.5 h-3.5" />
          </button>

          {/* Numbered List */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded-lg hover:bg-stone-200/80 transition-colors ${
              editor.isActive('orderedList')
                ? 'bg-syllabo-900 text-white hover:bg-syllabo-800'
                : 'text-slate-700'
            }`}
            title="Numbered Steps"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>

          {/* Blockquote */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded-lg hover:bg-stone-200/80 transition-colors ${
              editor.isActive('blockquote')
                ? 'bg-syllabo-900 text-white hover:bg-syllabo-800'
                : 'text-slate-700'
            }`}
            title="Important Note / Callout"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-stone-300 mx-0.5" />

          {/* Table Management Dropdown */}
          <div className="relative" ref={tableMenuRef}>
            <button
              type="button"
              onClick={() => setShowTableMenu(!showTableMenu)}
              className={`p-1.5 rounded-lg hover:bg-stone-200/80 transition-colors flex items-center gap-1 ${
                isTableActive ? 'bg-purple-100 text-purple-900 font-bold' : 'text-slate-700'
              }`}
              title="Table Operations"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden sm:inline">Table</span>
            </button>

            {showTableMenu && (
              <div className="absolute left-0 mt-1 w-48 bg-white border border-stone-200 rounded-xl shadow-lg p-1.5 z-30 space-y-1 text-[11px]">
                {!isTableActive ? (
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                      setShowTableMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-stone-100 text-slate-800 flex items-center gap-2"
                  >
                    <Plus className="w-3 h-3 text-emerald-600" />
                    Insert 3x3 Table
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        editor.chain().focus().addRowAfter().run();
                        setShowTableMenu(false);
                      }}
                      className="w-full text-left px-2 py-1 rounded-md hover:bg-stone-100 text-slate-800 flex items-center gap-1.5"
                    >
                      <Plus className="w-3 h-3 text-emerald-600" />
                      Add Row Below
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        editor.chain().focus().addColumnAfter().run();
                        setShowTableMenu(false);
                      }}
                      className="w-full text-left px-2 py-1 rounded-md hover:bg-stone-100 text-slate-800 flex items-center gap-1.5"
                    >
                      <Plus className="w-3 h-3 text-emerald-600" />
                      Add Column Right
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        editor.chain().focus().deleteRow().run();
                        setShowTableMenu(false);
                      }}
                      className="w-full text-left px-2 py-1 rounded-md hover:bg-stone-100 text-rose-600 flex items-center gap-1.5"
                    >
                      <Minus className="w-3 h-3 text-rose-500" />
                      Delete Current Row
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        editor.chain().focus().deleteColumn().run();
                        setShowTableMenu(false);
                      }}
                      className="w-full text-left px-2 py-1 rounded-md hover:bg-stone-100 text-rose-600 flex items-center gap-1.5"
                    >
                      <Minus className="w-3 h-3 text-rose-500" />
                      Delete Current Column
                    </button>
                    <div className="border-t border-stone-100 my-1" />
                    <button
                      type="button"
                      onClick={() => {
                        editor.chain().focus().deleteTable().run();
                        setShowTableMenu(false);
                      }}
                      className="w-full text-left px-2 py-1 rounded-md hover:bg-rose-50 text-rose-700 font-bold flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3 h-3 text-rose-600" />
                      Remove Entire Table
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Math Formula Button */}
          <button
            type="button"
            onClick={() => setShowMathModal(true)}
            className="p-1.5 rounded-lg hover:bg-stone-200/80 transition-colors text-slate-700 flex items-center gap-1"
            title="Insert KaTeX Mathematical Formula"
          >
            <Sigma className="w-3.5 h-3.5 text-purple-700" />
            <span className="text-[10px] hidden sm:inline text-purple-900 font-bold">Math</span>
          </button>

          {/* Image Insertion Button */}
          <button
            type="button"
            onClick={() => setShowImageModal(true)}
            className="p-1.5 rounded-lg hover:bg-stone-200/80 transition-colors text-slate-700 flex items-center gap-1"
            title="Insert Image (at cursor)"
          >
            <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[10px] hidden sm:inline text-blue-900 font-bold">Image</span>
          </button>

          <div className="ml-auto flex items-center gap-1">
            {/* Undo */}
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="p-1.5 rounded-lg hover:bg-stone-200/80 disabled:opacity-30 disabled:hover:bg-transparent text-slate-600"
              title="Undo"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>

            {/* Redo */}
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="p-1.5 rounded-lg hover:bg-stone-200/80 disabled:opacity-30 disabled:hover:bg-transparent text-slate-600"
              title="Redo"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Editor Content Area */}
        <EditorContent editor={editor} />
      </div>

      {/* Image Insertion Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Insert Academic Image</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Persistent Image URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/diagram.png"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-slate-800 focus:outline-none focus:border-syllabo-900"
                  autoFocus
                />
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  Provide a publicly accessible, persistent image URL (e.g. Supabase public asset, Cloudinary, Imgur, or academic CDN).
                  Temporary local blob URLs are not permitted.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Caption / Alt Text
                </label>
                <input
                  type="text"
                  placeholder="e.g. Figure 1.2: AVL Tree Balance Rotation"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-slate-800 focus:outline-none focus:border-syllabo-900"
                />
              </div>

              {imageUrl && (
                <div className="p-2 border border-stone-200 rounded-xl bg-stone-50 text-center">
                  <p className="text-[10px] text-slate-500 mb-1 font-semibold">Preview</p>
                  <img
                    src={imageUrl}
                    alt={imageAlt || 'Preview'}
                    className="max-h-36 mx-auto rounded-lg object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="80"><rect width="100%" height="100%" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="11">Image Failed to Load</text></svg>';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-slate-700 hover:bg-stone-50 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertImage}
                disabled={!imageUrl.trim()}
                className="px-4 py-2 rounded-xl bg-syllabo-900 text-white font-bold text-xs hover:bg-syllabo-800 disabled:opacity-40"
              >
                Insert Image at Cursor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KaTeX Math Insertion Modal */}
      {showMathModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sigma className="w-5 h-5 text-purple-700" />
                <h3 className="font-bold text-slate-900 text-sm">Insert KaTeX Mathematical Formula</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMathModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="radio"
                    name="mathType"
                    checked={!isDisplayMath}
                    onChange={() => setIsDisplayMath(false)}
                    className="accent-syllabo-900"
                  />
                  <span>Inline Formula (<code>$equation$</code>)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="radio"
                    name="mathType"
                    checked={isDisplayMath}
                    onChange={() => setIsDisplayMath(true)}
                    className="accent-syllabo-900"
                  />
                  <span>Display Block (<code>$$equation$$</code>)</span>
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  LaTeX Math Expression
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. \\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}"
                  value={mathFormula}
                  onChange={(e) => setMathFormula(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-slate-800 font-mono text-xs focus:outline-none focus:border-syllabo-900"
                  autoFocus
                />
              </div>

              {/* Quick Template Buttons */}
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">
                  Quick Academic Templates
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Fraction', latex: '\\frac{a}{b}' },
                    { label: 'Power', latex: 'x^{2}' },
                    { label: 'Subscript', latex: 'x_{i}' },
                    { label: 'Square Root', latex: '\\sqrt{x}' },
                    { label: 'Summation', latex: '\\sum_{i=1}^{n} x_i' },
                    { label: 'Big-O', latex: 'O(n \\log n)' },
                    { label: 'Matrix', latex: 'A[i, j]' },
                    { label: 'Greek (alpha, beta, theta)', latex: '\\alpha + \\beta = \\theta' },
                  ].map((tpl) => (
                    <button
                      key={tpl.label}
                      type="button"
                      onClick={() => setMathFormula(tpl.latex)}
                      className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-[10px] font-medium text-slate-700"
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Rendered Preview
                </label>
                {renderMathPreview()}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowMathModal(false)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-slate-700 hover:bg-stone-50 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertMath}
                disabled={!mathFormula.trim()}
                className="px-4 py-2 rounded-xl bg-syllabo-900 text-white font-bold text-xs hover:bg-syllabo-800 disabled:opacity-40"
              >
                Insert Formula
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicRichEditor;
