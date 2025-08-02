import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Bold, 
  Italic, 
  Underline, 
  Code, 
  Link as LinkIcon, 
  Undo, 
  Redo,
  Type,
  Highlighter,
  MessageSquare
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = "Start writing..."
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt('URL');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  const toggleMOLTHighlight = () => {
    editor.chain().focus().toggleHighlight({ color: '#FEF3C7' }).run();
  };

  const toggleTextMOLT = () => {
    editor.chain().focus().toggleHighlight({ color: '#E0F2FE' }).run();
  };

  return (
    <div className="w-full border border-input rounded-md">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30">
        {/* Font family */}
        <Select onValueChange={(value) => {
          if (value === 'sans') editor.chain().focus().unsetFontFamily().run();
          else editor.chain().focus().setFontFamily(value).run();
        }}>
          <SelectTrigger className="w-20 h-8">
            <SelectValue placeholder="Font" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sans">Sans</SelectItem>
            <SelectItem value="serif">Serif</SelectItem>
            <SelectItem value="mono">Mono</SelectItem>
          </SelectContent>
        </Select>

        {/* Font size */}
        <Select onValueChange={(value) => {
          if (value === 'p') editor.chain().focus().setParagraph().run();
          else if (value === 'h1') editor.chain().focus().toggleHeading({ level: 1 }).run();
          else if (value === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run();
          else if (value === 'h3') editor.chain().focus().toggleHeading({ level: 3 }).run();
        }}>
          <SelectTrigger className="w-20 h-8">
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="p">Normal</SelectItem>
            <SelectItem value="h3">H3</SelectItem>
            <SelectItem value="h2">H2</SelectItem>
            <SelectItem value="h1">H1</SelectItem>
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="h-8" />

        {/* Text formatting */}
        <Button
          variant={editor.isActive('bold') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          variant={editor.isActive('italic') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            editor.chain().focus().toggleItalic().run();
            // Add underline via CSS class (since TipTap doesn't have native underline)
            const selection = editor.view.state.selection;
            if (!selection.empty) {
              editor.commands.setTextSelection(selection);
            }
          }}
          className="h-8 w-8 p-0"
        >
          <Underline className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-8" />

        {/* MOLT Highlighting */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMOLTHighlight}
          className="h-8 w-8 p-0 bg-yellow-50 hover:bg-yellow-100"
          title="MOLT Highlight"
        >
          <Highlighter className="h-4 w-4 text-amber-700" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTextMOLT}
          className="h-8 w-8 p-0 bg-sky-50 hover:bg-sky-100"
          title="TextMOLT Side-note"
        >
          <MessageSquare className="h-4 w-4 text-sky-600" />
        </Button>

        <Separator orientation="vertical" className="h-8" />

        {/* Text color */}
        <input
          type="color"
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          className="w-8 h-8 border border-input rounded cursor-pointer"
          title="Text Color"
        />

        {/* Background highlight */}
        <input
          type="color"
          onChange={(e) => editor.chain().focus().toggleHighlight({ color: e.target.value }).run()}
          className="w-8 h-8 border border-input rounded cursor-pointer"
          title="Background Highlight"
        />

        <Separator orientation="vertical" className="h-8" />

        {/* Link */}
        <Button
          variant={editor.isActive('link') ? 'default' : 'ghost'}
          size="sm"
          onClick={addLink}
          className="h-8 w-8 p-0 text-indigo-600"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>

        {/* Code */}
        <Button
          variant={editor.isActive('code') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className="h-8 w-8 p-0"
        >
          <Code className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-8" />

        {/* Undo/Redo */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="h-8 w-8 p-0"
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="h-8 w-8 p-0"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <EditorContent 
        editor={editor} 
        className="min-h-[200px] p-4 prose prose-sm max-w-none focus-within:outline-none bg-popover text-popover-foreground rounded-lg border border-border"
        style={{ 
          fontFamily: 'inherit',
          fontSize: 'inherit',
          lineHeight: 'inherit' 
        }}
      />
    </div>
  );
};

export default RichTextEditor;