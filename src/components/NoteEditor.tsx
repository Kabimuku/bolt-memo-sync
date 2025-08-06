import { useState, useEffect } from "react";
import { ArrowLeft, Save, Pin, Archive, Trash2, Clock, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const isMobile = useIsMobile();
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
      <div className={cn(
        "sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        isMobile ? "px-4 py-3" : "px-6 py-4"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack} 
              className="hover:bg-accent rounded-lg"
            >
              <ArrowLeft className="h-4 w-4" />
              {!isMobile && <span className="ml-2">Back</span>}
            </Button>
            
            {!isMobile && (
              <span className="text-sm font-medium text-muted-foreground">
                {isNew ? 'New Note' : 'Edit Note'}
              </span>
            )}
            
            {hasChanges && (
              <Badge variant="secondary" className="text-xs bg-amber-50 text-amber-600 rounded-full">
                {isMobile ? "•" : "Unsaved changes"}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleSave} 
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
            >
              <Save className="h-4 w-4" />
              {!isMobile && <span className="ml-2">Save</span>}
            </Button>
            
            {note && !isMobile && (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handlePin} 
                  className={cn(
                    "rounded-lg",
                    note.is_pinned ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' : 'hover:bg-accent'
                  )}
                >
                  <Pin className={cn("h-4 w-4", note.is_pinned && "fill-current")} />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleArchive} 
                  className="hover:bg-accent rounded-lg"
                >
                  <Archive className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleDelete} 
                  className="text-destructive hover:bg-destructive/10 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile action buttons */}
        {note && isMobile && (
          <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-border">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handlePin}
              className={cn(
                "flex-1 rounded-lg",
                note.is_pinned ? 'text-amber-500 bg-amber-50' : ''
              )}
            >
              <Pin className={cn("h-4 w-4 mr-2", note.is_pinned && "fill-current")} />
              {note.is_pinned ? 'Unpin' : 'Pin'}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleArchive}
              className="flex-1 rounded-lg"
            >
              <Archive className="h-4 w-4 mr-2" />
              {note.is_archived ? 'Unarchive' : 'Archive'}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDelete}
              className="flex-1 text-destructive hover:bg-destructive/10 rounded-lg"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className={cn(
        "flex-1 flex flex-col overflow-auto",
        isMobile ? "p-4 space-y-4" : "p-6 lg:p-8 space-y-6"
      )}>
        <Input 
          placeholder="Untitled" 
          value={title} 
          onChange={e => handleTitleChange(e.target.value)} 
          className={cn(
            "font-bold border-none p-0 focus-visible:ring-0 placeholder:text-muted-foreground bg-transparent rounded-none shadow-none",
            isMobile ? "text-2xl" : "text-3xl lg:text-4xl"
          )}
        />
        
        <div className="flex-1 note-card p-4 lg:p-6">
          <RichTextEditor 
            content={content} 
            onChange={handleContentChange} 
            placeholder="Start writing your note..." 
          />
        </div>
        
        {note && (
          <div className={cn(
            "text-sm text-muted-foreground pt-4 mt-4 border-t border-border",
            isMobile ? "space-y-2" : "flex items-center justify-between"
          )}>
            <div className={cn(isMobile ? "space-y-1" : "flex items-center gap-6")}>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>Created {formatDate(note.created_at)}</span>
              </div>
              {!isMobile && (
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>Modified {formatDate(note.updated_at)}</span>
                </div>
              )}
            </div>
            
            {note.tag_ids && note.tag_ids.length > 0 && (
              <Badge variant="outline" className="text-xs bg-accent text-accent-foreground rounded-full">
                {note.tag_ids.length} tag{note.tag_ids.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>;
}