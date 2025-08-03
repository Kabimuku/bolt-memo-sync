import { useState, useEffect } from "react";
import { ArrowLeft, Save, Pin, Archive, Trash2, Calendar, Tag, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import RichTextEditor from "./RichTextEditor";
import { cn } from "@/lib/utils";
interface Note {
  id: string;
  title: string;
  content?: string;
  markdown?: string;
  created_at: string;
  updated_at: string;
  is_pinned: boolean;
  is_archived: boolean;
  tag_ids: string[];
}
interface NoteEditorProps {
  note: Note | null;
  onBack: () => void;
  onSave: (note: Partial<Note>) => void;
  onPin: (noteId: string) => void;
  onArchive: (noteId: string) => void;
  onDelete: (noteId: string) => void;
  isNew?: boolean;
}
export function NoteEditor({
  note,
  onBack,
  onSave,
  onPin,
  onArchive,
  onDelete,
  isNew = false
}: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const {
    toast
  } = useToast();
  useEffect(() => {
    console.log('NoteEditor: note changed', { note, isNew });
    if (note) {
      setTitle(note.title || "");
      // Prioritize content over markdown for display
      const noteContent = note.content || note.markdown || "";
      console.log('NoteEditor: setting content', { content: note.content, markdown: note.markdown, noteContent });
      setContent(noteContent);
      setHasChanges(false);
    } else if (isNew) {
      console.log('NoteEditor: new note');
      setTitle("");
      setContent("");
      setHasChanges(false);
    }
  }, [note, isNew]);
  const handleTitleChange = (value: string) => {
    setTitle(value);
    setHasChanges(true);
  };
  const handleContentChange = (value: string) => {
    setContent(value);
    setHasChanges(true);
  };
  const handleSave = () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your note",
        variant: "destructive"
      });
      return;
    }
    const noteData: Partial<Note> = {
      title: title.trim(),
      content: content,
      // Store HTML content in content field
      ...(note && {
        id: note.id
      })
    };
    onSave(noteData);
    setHasChanges(false);
    toast({
      title: "Success",
      description: isNew ? "Note created successfully" : "Note saved successfully"
    });
  };
  const handlePin = () => {
    if (note) {
      onPin(note.id);
      toast({
        title: "Note " + (note.is_pinned ? "unpinned" : "pinned"),
        description: note.is_pinned ? "Note removed from pins" : "Note pinned to top"
      });
    }
  };
  const handleArchive = () => {
    if (note) {
      onArchive(note.id);
      toast({
        title: "Note " + (note.is_archived ? "unarchived" : "archived"),
        description: note.is_archived ? "Note restored from archive" : "Note moved to archive"
      });
    }
  };
  const handleDelete = () => {
    if (note && window.confirm("Are you sure you want to delete this note?")) {
      onDelete(note.id);
      onBack();
      toast({
        title: "Note deleted",
        description: "Note has been permanently deleted",
        variant: "destructive"
      });
    }
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  return <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {isNew ? 'New Note' : 'Edit Note'}
          </span>
          {hasChanges && <Badge variant="secondary" className="text-xs sync-saving">
              Unsaved changes
            </Badge>}
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleSave} className="text-indigo-600 hover:bg-indigo-50">
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
          
          {note && <>
              <Button variant="ghost" size="sm" onClick={handlePin} className={cn("hover:bg-yellow-50", note.is_pinned ? 'text-yellow-400 bg-yellow-50' : 'text-muted-foreground')}>
                <Pin className={cn("h-4 w-4 mr-1", note.is_pinned && "fill-current")} />
                {note.is_pinned ? 'Unpin' : 'Pin'}
              </Button>
              
              <Button variant="ghost" size="sm" onClick={handleArchive} className="text-muted-foreground hover:bg-muted">
                <Archive className="h-4 w-4 mr-1" />
                {note.is_archived ? 'Unarchive' : 'Archive'}
              </Button>
              
              <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-500 hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </>}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col p-6 space-y-6 overflow-auto">
        <Input placeholder="Untitled" value={title} onChange={e => handleTitleChange(e.target.value)} className="text-3xl font-bold border-none p-0 focus-visible:ring-0 placeholder:text-muted-foreground text-foreground bg-gray-700" />
        
        <div className="flex-1">
          <RichTextEditor content={content} onChange={handleContentChange} placeholder="Start writing your note..." />
        </div>
        
        {note && <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Created {formatDate(note.created_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Modified {formatDate(note.updated_at)}</span>
              </div>
            </div>
            {note.tag_ids && note.tag_ids.length > 0 && <Badge variant="outline" className="text-xs">
                {note.tag_ids.length} tag{note.tag_ids.length !== 1 ? 's' : ''}
              </Badge>}
          </div>}
      </div>
    </div>;
}