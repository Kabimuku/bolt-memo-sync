import { Clock, Archive, Pin, MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
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
interface NoteGridProps {
  notes: Note[];
  onNoteSelect: (note: Note) => void;
  onNotePin: (noteId: string) => void;
  onNoteArchive: (noteId: string) => void;
  onNoteDelete: (noteId: string) => void;
}
export function NoteGrid({
  notes,
  onNoteSelect,
  onNotePin,
  onNoteArchive,
  onNoteDelete
}: NoteGridProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };
  const getPreview = (note: Note) => {
    const content = note.content || note.markdown || '';
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
  };
  if (notes.length === 0) {
    return <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="text-muted-foreground mb-4">
          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No notes found</h3>
          <p className="text-sm">Create your first note to get started</p>
        </div>
      </div>;
  }
  return <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {notes.map(note => <Card key={note.id} className="cursor-pointer hover:shadow-md transition-shadow relative group" onClick={() => onNoteSelect(note)}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0 bg-slate-100">
                  {note.is_pinned && <Pin className="h-4 w-4 text-primary flex-shrink-0" />}
                  <h3 className="font-medium text-sm truncate text-slate-800">{note.title}</h3>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={e => {
                  e.stopPropagation();
                  onNotePin(note.id);
                }}>
                      {note.is_pinned ? 'Unpin' : 'Pin'} Note
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={e => {
                  e.stopPropagation();
                  onNoteArchive(note.id);
                }}>
                      {note.is_archived ? 'Unarchive' : 'Archive'} Note
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={e => {
                  e.stopPropagation();
                  onNoteDelete(note.id);
                }}>
                      Delete Note
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0 bg-slate-50">
              <p className="text-xs mb-3 line-clamp-3 text-slate-950">
                {getPreview(note)}
              </p>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(note.updated_at)}
                </span>
                
                {note.is_archived && <Badge variant="secondary" className="text-xs">
                    <Archive className="h-3 w-3 mr-1" />
                    Archived
                  </Badge>}
              </div>
              
              {note.tag_ids.length > 0 && <div className="flex flex-wrap gap-1 mt-2">
                  {note.tag_ids.slice(0, 3).map(tagId => <Badge key={tagId} variant="outline" className="text-xs">
                      Tag {tagId.slice(0, 8)}
                    </Badge>)}
                  {note.tag_ids.length > 3 && <Badge variant="outline" className="text-xs">
                      +{note.tag_ids.length - 3}
                    </Badge>}
                </div>}
            </CardContent>
          </Card>)}
      </div>
    </div>;
}