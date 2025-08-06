import { Clock, Archive, Pin, MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const isMobile = useIsMobile();
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
    // Strip HTML tags for preview
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length > 100 ? textContent.substring(0, 100) + '...' : textContent;
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
  return <div className={cn("min-h-screen bg-background", isMobile ? "p-4" : "p-6")}>
      <div className={cn(
        "grid gap-4",
        isMobile 
          ? "grid-cols-1 sm:grid-cols-2" 
          : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      )}>
        {notes.map(note => <Card key={note.id} className="cursor-pointer hover-lift hover-glow glass-card transition-all duration-300 relative group border-0" onClick={() => onNoteSelect(note)}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {note.is_pinned && <Pin className="h-4 w-4 text-yellow-400 flex-shrink-0 fill-current" />}
                  <h3 className="font-semibold text-sm truncate text-foreground">{note.title}</h3>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg hover:bg-purple-50" onClick={e => e.stopPropagation()}>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass-card">
                    <DropdownMenuItem onClick={e => {
                  e.stopPropagation();
                  onNotePin(note.id);
                }} className="rounded-lg">
                      {note.is_pinned ? 'Unpin' : 'Pin'} Note
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={e => {
                  e.stopPropagation();
                  onNoteArchive(note.id);
                }} className="rounded-lg">
                      {note.is_archived ? 'Unarchive' : 'Archive'} Note
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-rose-500 rounded-lg" onClick={e => {
                  e.stopPropagation();
                  onNoteDelete(note.id);
                }}>
                      Delete Note
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <p className="text-sm mb-4 line-clamp-3 text-muted-foreground leading-relaxed">
                {getPreview(note)}
              </p>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDate(note.updated_at)}
                </span>
                
                {note.is_archived && <Badge variant="secondary" className="text-xs bg-purple-50 text-purple-600 rounded-full">
                    <Archive className="h-3 w-3 mr-1" />
                    Archived
                  </Badge>}
              </div>
              
              {note.tag_ids.length > 0 && <div className="flex flex-wrap gap-2 mt-3">
                  {note.tag_ids.slice(0, 3).map(tagId => <Badge key={tagId} variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200 rounded-full">
                      Tag {tagId.slice(0, 8)}
                    </Badge>)}
                  {note.tag_ids.length > 3 && <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-600 border-indigo-200 rounded-full">
                      +{note.tag_ids.length - 3}
                    </Badge>}
                </div>}
            </CardContent>
          </Card>)}
      </div>
    </div>;
}