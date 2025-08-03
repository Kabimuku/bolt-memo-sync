import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FolderOpen, 
  FileText, 
  Pin, 
  Archive,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

interface TreeViewItemProps {
  id: string;
  type: 'folder' | 'note';
  title: string;
  level: number;
  isExpanded?: boolean;
  isActive?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  hasChildren?: boolean;
  onToggle?: () => void;
  onSelect?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  onPin?: () => void;
  children?: React.ReactNode;
}

const TreeViewItem: React.FC<TreeViewItemProps> = ({
  id,
  type,
  title,
  level,
  isExpanded = false,
  isActive = false,
  isPinned = false,
  isArchived = false,
  hasChildren = false,
  onToggle,
  onSelect,
  onRename,
  onDelete,
  onArchive,
  onPin,
  children,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const indent = level * 16;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        'relative',
        isDragging && 'drag-preview'
      )}
    >
      <div
        className={cn(
          'flex items-center gap-1 px-2 py-1 rounded-md cursor-pointer select-none hover:bg-sidebar-accent transition-colors',
          isActive && 'bg-indigo-100 text-foreground font-medium',
          isArchived && 'opacity-60'
        )}
        style={{ paddingLeft: `${8 + indent}px` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSelect?.();
        }}
        {...listeners}
      >
        {/* Expand/Collapse chevron */}
        {type === 'folder' && hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggle?.();
            }}
            className="h-4 w-4 p-0 hover:bg-transparent"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        )}

        {/* Icon */}
        <div className="flex-shrink-0">
          {type === 'folder' ? (
            isExpanded ? (
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Folder className="h-4 w-4 text-muted-foreground" />
            )
          ) : (
            <FileText className="h-4 w-4 text-muted-foreground" />
          )}
        </div>

        {/* Title */}
        <span className="flex-1 truncate text-sm">
          {title}
        </span>

        {/* Status indicators */}
        <div className="flex items-center gap-1">
          {isPinned && (
            <Pin className="h-3 w-3 text-yellow-400 fill-current" />
          )}
          {isArchived && (
            <Archive className="h-3 w-3 text-muted-foreground" />
          )}
        </div>

        {/* Three-dot menu */}
        {isHovered && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => e.stopPropagation()}
                className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 bg-white dark:bg-gray-800 border shadow-lg z-50">
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onRename?.();
                }}
                className="hover:bg-accent"
              >
                ✏️ Rename
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onPin?.();
                }}
                className="hover:bg-accent"
              >
                📌 {isPinned ? 'Unpin' : 'Pin'}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive?.();
                }}
                className="hover:bg-accent"
              >
                📦 {isArchived ? 'Unarchive' : 'Archive'}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                className="text-destructive hover:bg-accent"
              >
                🗑️ Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Children */}
      {type === 'folder' && isExpanded && children && (
        <div>{children}</div>
      )}
    </div>
  );
};

export default TreeViewItem;