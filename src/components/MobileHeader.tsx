import React from 'react';
import { Menu, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface MobileHeaderProps {
  onToggleSidebar: () => void;
  onCreateNote: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  title?: string;
  className?: string;
}

export function MobileHeader({
  onToggleSidebar,
  onCreateNote,
  searchQuery,
  onSearchChange,
  title = "Bolt-Memo",
  className
}: MobileHeaderProps) {
  return (
    <header className={cn("mobile-header h-16 px-4 flex items-center gap-3", className)}>
      {/* Hamburger Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleSidebar}
        className="p-2 hover:bg-accent rounded-lg transition-colors"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* App Title with Logo */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded transform rotate-45"></div>
            <h1 className="heading-2 truncate text-primary font-bold">{title}</h1>
          </div>
        </div>
        <div className="sm:hidden flex items-center gap-2">
          <div className="w-5 h-5 bg-primary rounded transform rotate-45"></div>
          <span className="text-primary font-bold text-lg">{title}</span>
        </div>
        
        {/* Mobile Search - Full width on small screens */}
        <div className="relative sm:hidden">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 h-10 bg-input border-border rounded-lg"
          />
        </div>
      </div>

      {/* Desktop Search */}
      <div className="hidden sm:flex flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes or #tags..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 h-10 bg-input border-border rounded-lg"
          />
        </div>
      </div>

      {/* New Note Button - Desktop only */}
      <Button
        onClick={onCreateNote}
        className="hidden sm:flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-4 h-10"
      >
        <Plus className="h-4 w-4" />
        <span>New Note</span>
      </Button>
    </header>
  );
}