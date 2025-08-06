import React from 'react';
import { X, Home, Archive, Settings, User, LogOut, Download, Upload, Moon, Sun, File, Folder, Plus } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onViewChange: (view: string) => void;
  showArchived: boolean;
  onToggleArchived: () => void;
  onCreateNote: () => void;
  onCreateFolder?: () => void;
  folders: any[];
  user?: any;
  onLogout?: () => void;
  onExportNotes?: () => void;
  onImportNotes?: () => void;
}

export function MobileSidebar({
  isOpen,
  onClose,
  currentView,
  onViewChange,
  showArchived,
  onToggleArchived,
  onCreateNote,
  onCreateFolder,
  folders,
  user,
  onLogout,
  onExportNotes,
  onImportNotes
}: MobileSidebarProps) {
  const { theme, setTheme } = useTheme();

  const handleViewChange = (view: string) => {
    onViewChange(view);
    onClose();
  };

  const handleCreateNote = () => {
    onCreateNote();
    onClose();
  };

  const handleCreateFolder = () => {
    onCreateFolder?.();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-full sm:w-80 p-0">
        <SheetHeader className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="heading-2">Bolt-Memo</SheetTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2 hover:bg-accent rounded-lg">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* New Note Button */}
          <div className="p-6">
            <Button
              onClick={handleCreateNote}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-12 text-base font-medium"
            >
              <Plus className="mr-2 h-5 w-5" />
              New Note
            </Button>
          </div>

          {/* Navigation */}
          <div className="px-6 space-y-2">
            <Button
              variant="ghost"
              onClick={() => handleViewChange('notes')}
              className={cn(
                "w-full justify-start rounded-lg h-12 text-base",
                currentView === 'notes' && "bg-accent text-accent-foreground font-medium"
              )}
            >
              <Home className="mr-3 h-5 w-5" />
              All Notes
            </Button>

            <Button
              variant="ghost"
              onClick={() => handleViewChange('archived')}
              className={cn(
                "w-full justify-start rounded-lg h-12 text-base",
                currentView === 'archived' && "bg-accent text-accent-foreground font-medium"
              )}
            >
              <Archive className="mr-3 h-5 w-5" />
              Archived
            </Button>
          </div>

          {/* Show Archived Toggle */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <span className="body-text font-medium">Show Archived</span>
              <Switch checked={showArchived} onCheckedChange={onToggleArchived} />
            </div>
          </div>

          <Separator className="mx-6" />

          {/* Folders Section */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="body-text font-semibold">Folders</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCreateFolder}
                className="p-2 hover:bg-accent rounded-lg"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              {folders.map((folder) => (
                <Button
                  key={folder.id}
                  variant="ghost"
                  className="w-full justify-start rounded-lg h-10 text-sm"
                >
                  <Folder className="mr-3 h-4 w-4" />
                  {folder.name}
                </Button>
              ))}
            </div>
          </div>

          <Separator className="mx-6" />

          {/* Settings Section */}
          <div className="px-6 py-4 space-y-2">
            <h3 className="body-text font-semibold mb-3">Settings</h3>
            
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                <span className="body-text">Dark Mode</span>
              </div>
              <Switch 
                checked={theme === 'dark'} 
                onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              />
            </div>

            {/* Export/Import */}
            <Button
              variant="ghost"
              onClick={onExportNotes}
              className="w-full justify-start rounded-lg h-10 text-sm"
            >
              <Download className="mr-3 h-4 w-4" />
              Export Notes
            </Button>

            <Button
              variant="ghost"
              onClick={onImportNotes}
              className="w-full justify-start rounded-lg h-10 text-sm"
            >
              <Upload className="mr-3 h-4 w-4" />
              Import Notes
            </Button>
          </div>

          {/* User Section */}
          {user && (
            <>
              <Separator className="mx-6" />
              <div className="px-6 py-4 mt-auto">
                <div className="flex items-center gap-3 mb-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="caption-text truncate">{user.email}</span>
                </div>
                
                <Button
                  variant="ghost"
                  onClick={onLogout}
                  className="w-full justify-start rounded-lg h-10 text-sm text-destructive hover:text-destructive"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}