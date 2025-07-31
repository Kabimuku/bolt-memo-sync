import { useState, useEffect } from "react";
import { ArrowLeft, Save, Pin, Archive, Trash2, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content || note.markdown || "");
      setHasChanges(false);
    } else if (isNew) {
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
        variant: "destructive",
      });
      return;
    }

    const noteData: Partial<Note> = {
      title: title.trim(),
      content: content,
      ...(note && { id: note.id })
    };

    onSave(noteData);
    setHasChanges(false);
    
    toast({
      title: "Success",
      description: isNew ? "Note created successfully" : "Note saved successfully",
    });
  };

  const handlePin = () => {
    if (note) {
      onPin(note.id);
      toast({
        title: "Note " + (note.is_pinned ? "unpinned" : "pinned"),
        description: note.is_pinned ? "Note removed from pins" : "Note pinned to top",
      });
    }
  };

  const handleArchive = () => {
    if (note) {
      onArchive(note.id);
      toast({
        title: "Note " + (note.is_archived ? "unarchived" : "archived"),
        description: note.is_archived ? "Note restored from archive" : "Note moved to archive",
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
        variant: "destructive",
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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="outline" className="text-xs">
                Unsaved changes
              </Badge>
            )}
            
            <Button onClick={handleSave} size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            
            {note && (
              <>
                <Button variant="outline" size="sm" onClick={handlePin}>
                  <Pin className={`h-4 w-4 mr-2 ${note.is_pinned ? 'text-primary' : ''}`} />
                  {note.is_pinned ? 'Unpin' : 'Pin'}
                </Button>
                
                <Button variant="outline" size="sm" onClick={handleArchive}>
                  <Archive className="h-4 w-4 mr-2" />
                  {note.is_archived ? 'Unarchive' : 'Archive'}
                </Button>
                
                <Button variant="outline" size="sm" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
        
        {/* Title Input */}
        <Input
          placeholder="Note title..."
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="text-xl font-medium border-none px-0 focus-visible:ring-0"
        />
        
        {/* Metadata */}
        {note && (
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Created: {formatDate(note.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Modified: {formatDate(note.updated_at)}
            </span>
            {note.tag_ids.length > 0 && (
              <span className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {note.tag_ids.length} tags
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Content Editor */}
      <div className="flex-1 p-4">
        <Textarea
          placeholder="Start writing your note..."
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          className="h-full resize-none border-none focus-visible:ring-0 text-base"
        />
      </div>
    </div>
  );
}