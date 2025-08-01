import React, { useState, useMemo } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { 
  Search, 
  Home, 
  Archive, 
  Settings, 
  Plus, 
  Hash,
  X,
  User,
  LogOut,
  Upload,
  Download,
  Moon,
  Sun
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TreeViewItem from './TreeViewItem';
import { cn } from '@/lib/utils';

interface Note {
  id: string;
  title: string;
  content?: string;
  folder_id?: string;
  is_pinned?: boolean;
  is_archived?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface Folder {
  id: string;
  name: string;
  user_id: string;
  color?: string;
  icon?: string;
}

interface EnhancedAppSidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  showArchived: boolean;
  onToggleArchived: () => void;
  onCreateNote: () => void;
  onSearchNotes: (query: string) => void;
  onSearchTags: (query: string) => void;
  notes: Note[];
  folders: Folder[];
  onNoteSelect: (note: Note) => void;
  onCreateFolder?: () => void;
  onMoveNote?: (noteId: string, folderId: string | null) => void;
  user?: any;
  onLogout?: () => void;
  onExportNotes?: () => void;
  onImportNotes?: () => void;
}

const EnhancedAppSidebar: React.FC<EnhancedAppSidebarProps> = ({
  currentView,
  onViewChange,
  showArchived,
  onToggleArchived,
  onCreateNote,
  onSearchNotes,
  onSearchTags,
  notes,
  folders,
  onNoteSelect,
  onCreateFolder,
  onMoveNote,
  user,
  onLogout,
  onExportNotes,
  onImportNotes,
}) => {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { theme, setTheme } = useTheme();
  const [noteSearchQuery, setNoteSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // Group notes by folder
  const organizedNotes = useMemo(() => {
    const folderMap = new Map<string, Note[]>();
    const rootNotes: Note[] = [];

    notes.forEach(note => {
      if (note.folder_id) {
        if (!folderMap.has(note.folder_id)) {
          folderMap.set(note.folder_id, []);
        }
        folderMap.get(note.folder_id)!.push(note);
      } else {
        rootNotes.push(note);
      }
    });

    return { folderMap, rootNotes };
  }, [notes]);

  const handleUnifiedSearch = (query: string) => {
    setNoteSearchQuery(query);
    
    // Check if it's a tag search (starts with #)
    if (query.startsWith('#')) {
      const tagQuery = query.slice(1); // Remove the # symbol
      onSearchTags(tagQuery);
    } else {
      onSearchNotes(query);
    }
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      // Handle note moving to folder
      if (over.id.startsWith('folder-')) {
        const folderId = over.id.replace('folder-', '');
        onMoveNote?.(active.id, folderId);
      } else if (over.id === 'root') {
        onMoveNote?.(active.id, null);
      }
    }
  };

  const renderTreeView = () => {
    const allItems: string[] = [];
    
    // Add root notes
    organizedNotes.rootNotes.forEach(note => allItems.push(note.id));
    
    // Add folders and their notes
    folders.forEach(folder => {
      allItems.push(`folder-${folder.id}`);
      const folderNotes = organizedNotes.folderMap.get(folder.id) || [];
      folderNotes.forEach(note => allItems.push(note.id));
    });

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={allItems} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {/* Root notes */}
            {organizedNotes.rootNotes.map(note => (
              <TreeViewItem
                key={note.id}
                id={note.id}
                type="note"
                title={note.title}
                level={0}
                isPinned={note.is_pinned}
                isArchived={note.is_archived}
                onSelect={() => onNoteSelect(note)}
              />
            ))}

            {/* Folders and their notes */}
            {folders.map(folder => {
              const folderNotes = organizedNotes.folderMap.get(folder.id) || [];
              const isExpanded = expandedFolders.has(folder.id);
              
              return (
                <div key={folder.id}>
                  <TreeViewItem
                    id={`folder-${folder.id}`}
                    type="folder"
                    title={folder.name}
                    level={0}
                    isExpanded={isExpanded}
                    hasChildren={folderNotes.length > 0}
                    onToggle={() => toggleFolder(folder.id)}
                  >
                    {folderNotes.map(note => (
                      <TreeViewItem
                        key={note.id}
                        id={note.id}
                        type="note"
                        title={note.title}
                        level={1}
                        isPinned={note.is_pinned}
                        isArchived={note.is_archived}
                        onSelect={() => onNoteSelect(note)}
                      />
                    ))}
                  </TreeViewItem>
                </div>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    );
  };

  if (collapsed) {
    return (
      <Sidebar className="w-14">
        <SidebarContent className="flex flex-col items-center py-4 space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewChange('notes')}
            className={cn(
              "w-8 h-8 p-0",
              currentView === 'notes' && "bg-indigo-100"
            )}
          >
            <Home className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onCreateNote}
            className="w-8 h-8 p-0 bg-indigo-600 text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar className="w-80">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BM</span>
            </div>
            <span className="font-semibold">Bolt-Memo</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-auto">
        {/* New Note Button */}
        <div className="p-4">
          <Button
            onClick={onCreateNote}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Note
          </Button>
        </div>

        {/* Unified Smart Search */}
        <div className="px-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes or #tags..."
              value={noteSearchQuery}
              onChange={(e) => handleUnifiedSearch(e.target.value)}
              className="pl-10 bg-search-input"
            />
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => onViewChange('notes')}
                isActive={currentView === 'notes'}
                className={cn(
                  "w-full justify-start",
                  currentView === 'notes' && "bg-indigo-200 text-foreground font-medium"
                )}
              >
                <Home className="mr-2 h-4 w-4" />
                All Notes
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Show Archived Toggle */}
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Show Archived</span>
            <Switch
              checked={showArchived}
              onCheckedChange={onToggleArchived}
            />
          </div>
        </div>

        {/* Folders & Notes Tree View */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            <span>Folders</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCreateFolder}
              className="h-6 w-6 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderTreeView()}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Settings Footer */}
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex-1 justify-start h-10 px-3"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span className="flex-1 text-left">Settings</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {user ? (
                <>
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    <User className="inline mr-2 h-3 w-3" />
                    {user.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} className="text-red-500">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem className="text-indigo-600">
                    🔐 Login
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-emerald-500">
                    🆕 Sign Up
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onExportNotes} className="text-indigo-600">
                <Download className="mr-2 h-4 w-4" />
                Export Notes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onImportNotes} className="text-emerald-500">
                <Upload className="mr-2 h-4 w-4" />
                Import Notes
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="justify-between"
              >
                <span className="flex items-center">
                  {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                  Dark Mode
                </span>
                <Switch checked={theme === 'dark'} />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <SidebarTrigger className="h-10 w-10 flex-shrink-0">
            <X className="h-4 w-4" />
          </SidebarTrigger>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default EnhancedAppSidebar;