import { useState } from "react";
import { 
  FileText, 
  Archive, 
  Folder, 
  Settings, 
  Search, 
  Plus,
  Moon,
  Sun,
  Download,
  Upload
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface AppSidebarProps {
  onViewChange: (view: 'all-notes' | 'archived' | 'settings') => void;
  currentView: string;
  showArchived: boolean;
  onToggleArchived: (show: boolean) => void;
  onCreateNote: () => void;
  onSearchNotes: (query: string) => void;
  onSearchTags: (query: string) => void;
}

export function AppSidebar({ 
  onViewChange, 
  currentView, 
  showArchived,
  onToggleArchived,
  onCreateNote,
  onSearchNotes,
  onSearchTags
}: AppSidebarProps) {
  const { state } = useSidebar();
  const { theme, setTheme } = useTheme();
  const collapsed = state === 'collapsed';
  const [noteSearch, setNoteSearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");

  const handleNoteSearch = (value: string) => {
    setNoteSearch(value);
    onSearchNotes(value);
  };

  const handleTagSearch = (value: string) => {
    setTagSearch(value);
    onSearchTags(value);
  };

  const mainItems = [
    { 
      id: 'all-notes',
      title: "All Notes", 
      icon: FileText,
      onClick: () => onViewChange('all-notes')
    },
  ];

  return (
    <Sidebar className={collapsed ? "w-14" : "w-80"} collapsible="icon">
      <SidebarContent className="flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          {!collapsed && (
            <h1 className="text-xl font-bold text-primary">Bolt-Memo</h1>
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    asChild
                    className={currentView === item.id ? "bg-accent text-accent-foreground" : ""}
                  >
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={item.onClick}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Show Archived Toggle */}
        {!collapsed && (
          <div className="px-4 py-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-archived"
                checked={showArchived}
                onCheckedChange={onToggleArchived}
              />
              <Label htmlFor="show-archived" className="text-sm">
                Show Archived
              </Label>
            </div>
          </div>
        )}

        {/* Search Section */}
        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel>Search</SidebarGroupLabel>
            <SidebarGroupContent className="space-y-2">
              <div className="px-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search notes..."
                    value={noteSearch}
                    onChange={(e) => handleNoteSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="px-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tags..."
                    value={tagSearch}
                    onChange={(e) => handleTagSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Folders Section */}
        <SidebarGroup>
          <SidebarGroupLabel>
            Folders
            {!collapsed && (
              <Button size="sm" variant="ghost" className="ml-auto h-6 w-6 p-0">
                <Plus className="h-3 w-3" />
              </Button>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Folder className="mr-2 h-4 w-4" />
                  {!collapsed && <span>General</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom Section */}
        <div className="mt-auto">
          <Separator className="mb-4" />
          
          {/* Settings View Toggle */}
          <div className="px-2 mb-4">
            <SidebarMenuButton
              className={currentView === 'settings' ? "bg-accent text-accent-foreground" : ""}
              onClick={() => onViewChange('settings')}
            >
              <Settings className="mr-2 h-4 w-4" />
              {!collapsed && <span>Settings</span>}
            </SidebarMenuButton>
          </div>

          {/* Settings Panel (when in settings view and not collapsed) */}
          {currentView === 'settings' && !collapsed && (
            <div className="px-4 py-2 space-y-4 border-t">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Preferences</h3>
                
                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    <Label className="text-sm">Dark Mode</Label>
                  </div>
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  />
                </div>

                {/* Export/Import */}
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Export Notes
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Upload className="mr-2 h-4 w-4" />
                    Import Notes
                  </Button>
                </div>

                {/* New Note Button */}
                <Button 
                  onClick={onCreateNote}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Note
                </Button>
              </div>
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}