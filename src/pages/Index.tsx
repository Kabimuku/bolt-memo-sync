import { useState, useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import EnhancedAppSidebar from "@/components/EnhancedAppSidebar";
import { NoteGrid } from "@/components/NoteGrid";
import { NoteEditor } from "@/components/NoteEditor";
import { AuthPage } from "@/components/AuthPage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
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
  user_id: string;
}
const Index = () => {
  const {
    user,
    loading,
    signOut
  } = useAuth();
  const [currentView, setCurrentView] = useState('all-notes');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isNewNote, setIsNewNote] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [noteSearchQuery, setNoteSearchQuery] = useState("");
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const {
    toast
  } = useToast();

  // Fetch notes
  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  // Filter notes based on search and archived state
  useEffect(() => {
    let filtered = notes;

    // Filter by archived state
    if (!showArchived) {
      filtered = filtered.filter(note => !note.is_archived);
    }

    // Filter by note search query
    if (noteSearchQuery.trim()) {
      filtered = filtered.filter(note => note.title.toLowerCase().includes(noteSearchQuery.toLowerCase()) || (note.content || note.markdown || '').toLowerCase().includes(noteSearchQuery.toLowerCase()));
    }

    // Sort: pinned notes first, then by updated date
    filtered.sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) {
        return a.is_pinned ? -1 : 1;
      }
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
    setFilteredNotes(filtered);
  }, [notes, showArchived, noteSearchQuery, tagSearchQuery]);
  const fetchNotes = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('notes').select('*').eq('user_id', user?.id).order('updated_at', {
        ascending: false
      });
      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch notes",
        variant: "destructive"
      });
    }
  };
  const handleCreateNote = () => {
    setSelectedNote(null);
    setIsNewNote(true);
    setCurrentView('editor');
  };

  const handleCreateFolder = async () => {
    if (!user) return;
    
    const folderName = window.prompt('Enter folder name:');
    if (!folderName?.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('folders')
        .insert({
          name: folderName.trim(),
          user_id: user.id
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Folder created successfully"
      });
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive"
      });
    }
  };

  const handleExportNotes = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      const exportData = {
        exported_at: new Date().toISOString(),
        user_email: user.email,
        notes: data
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notes-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Notes exported successfully"
      });
    } catch (error) {
      console.error('Error exporting notes:', error);
      toast({
        title: "Error",
        description: "Failed to export notes",
        variant: "destructive"
      });
    }
  };

  const handleImportNotes = () => {
    if (!user) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const importData = JSON.parse(text);
        
        if (!importData.notes || !Array.isArray(importData.notes)) {
          throw new Error('Invalid file format');
        }
        
        const notesToImport = importData.notes.map((note: any) => ({
          title: note.title || 'Imported Note',
          content: note.content || note.markdown || '',
          user_id: user.id,
          tag_ids: note.tag_ids || [],
          is_pinned: false,
          is_archived: false
        }));
        
        const { data, error } = await supabase
          .from('notes')
          .insert(notesToImport)
          .select();
          
        if (error) throw error;
        
        setNotes(prev => [...data, ...prev]);
        
        toast({
          title: "Success",
          description: `Imported ${data.length} notes successfully`
        });
      } catch (error) {
        console.error('Error importing notes:', error);
        toast({
          title: "Error",
          description: "Failed to import notes. Please check the file format.",
          variant: "destructive"
        });
      }
    };
    
    input.click();
  };
  const handleNoteSelect = (note: Note) => {
    console.log('Index: note selected', note);
    setSelectedNote(note);
    setIsNewNote(false);
    setCurrentView('editor');
  };
  const handleNoteSave = async (noteData: Partial<Note>) => {
    if (!user) return;
    try {
      if (isNewNote) {
        const {
          data,
          error
        } = await supabase.from('notes').insert({
          title: noteData.title || 'Untitled',
          content: noteData.content,
          user_id: user.id,
          tag_ids: []
        }).select().single();
        if (error) throw error;
        setNotes(prev => [data, ...prev]);
        setSelectedNote(data);
        setIsNewNote(false);
      } else if (selectedNote) {
        const {
          data,
          error
        } = await supabase.from('notes').update({
          ...noteData,
          updated_at: new Date().toISOString()
        }).eq('id', selectedNote.id).select().single();
        if (error) throw error;
        setNotes(prev => prev.map(note => note.id === selectedNote.id ? data : note));
        setSelectedNote(data);
      }
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive"
      });
    }
  };
  const handleNotePin = async (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    try {
      const {
        data,
        error
      } = await supabase.from('notes').update({
        is_pinned: !note.is_pinned,
        updated_at: new Date().toISOString()
      }).eq('id', noteId).select().single();
      if (error) throw error;
      setNotes(prev => prev.map(n => n.id === noteId ? data : n));
      if (selectedNote?.id === noteId) {
        setSelectedNote(data);
      }
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive"
      });
    }
  };
  const handleNoteArchive = async (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    try {
      const {
        data,
        error
      } = await supabase.from('notes').update({
        is_archived: !note.is_archived,
        updated_at: new Date().toISOString()
      }).eq('id', noteId).select().single();
      if (error) throw error;
      setNotes(prev => prev.map(n => n.id === noteId ? data : n));
      if (selectedNote?.id === noteId) {
        setSelectedNote(data);
      }
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive"
      });
    }
  };
  const handleNoteDelete = async (noteId: string) => {
    try {
      const {
        error
      } = await supabase.from('notes').delete().eq('id', noteId);
      if (error) throw error;
      setNotes(prev => prev.filter(n => n.id !== noteId));
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
        setCurrentView('all-notes');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive"
      });
    }
  };
  const handleBack = () => {
    setSelectedNote(null);
    setIsNewNote(false);
    setCurrentView('all-notes');
  };
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>;
  }
  if (!user) {
    return <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthPage onAuthSuccess={() => {}} />
      </ThemeProvider>;
  }
  const renderMainContent = () => {
    if (currentView === 'editor' || isNewNote) {
      return <NoteEditor note={selectedNote} onBack={handleBack} onSave={handleNoteSave} onPin={handleNotePin} onArchive={handleNoteArchive} onDelete={handleNoteDelete} isNew={isNewNote} />;
    }
    if (currentView === 'settings') {
      return <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Settings</h2>
          <p className="text-muted-foreground">Settings panel is integrated in the sidebar when this view is active.</p>
        </div>;
    }
    return <NoteGrid notes={filteredNotes} onNoteSelect={handleNoteSelect} onNotePin={handleNotePin} onNoteArchive={handleNoteArchive} onNoteDelete={handleNoteDelete} />;
  };
  return <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
        <EnhancedAppSidebar onViewChange={setCurrentView} currentView={currentView} showArchived={showArchived} onToggleArchived={() => setShowArchived(!showArchived)} onCreateNote={handleCreateNote} onCreateFolder={handleCreateFolder} onSearchNotes={setNoteSearchQuery} onSearchTags={setTagSearchQuery} notes={filteredNotes} folders={[]} onNoteSelect={handleNoteSelect} onNotePin={handleNotePin} onNoteArchive={handleNoteArchive} onNoteDelete={handleNoteDelete} user={user} onLogout={() => supabase.auth.signOut()} onExportNotes={handleExportNotes} onImportNotes={handleImportNotes} />
          
          <main className="flex-1 flex flex-col">
            
            
            <div className="flex-1">
              {renderMainContent()}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </ThemeProvider>;
};
export default Index;