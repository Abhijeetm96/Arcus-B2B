import * as React from 'react';
import { 
  Folder, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Pin,
  Star,
  Users2,
  Bookmark
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export interface SidebarView {
  id: string;
  label: string;
  count?: number;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface WorkspaceLeftSidebarProps {
  views: SidebarView[];
  activeViewId: string;
  onViewSelect: (id: string) => void;
  teams?: { id: string; name: string }[];
  projects?: { id: string; name: string }[];
  favorites?: { id: string; name: string }[];
  density: 'comfort' | 'compact';
  onDensityToggle: () => void;
  isCollapsed?: boolean;
  onCollapseToggle?: () => void;
}

export function WorkspaceLeftSidebar({
  views,
  activeViewId,
  onViewSelect,
  teams = [],
  projects = [],
  favorites = [],
  density,
  onDensityToggle,
  isCollapsed = false,
  onCollapseToggle
}: WorkspaceLeftSidebarProps) {
  const isCompact = density === 'compact';

  if (isCollapsed) {
    return (
      <div className="w-12 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 justify-between h-full select-none">
        <div className="flex flex-col items-center gap-4 w-full">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-400 hover:text-slate-100"
            onClick={onCollapseToggle}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="flex flex-col items-center gap-2 w-full mt-4">
            {views.map((v) => {
              const Icon = v.icon || Folder;
              return (
                <button
                  key={v.id}
                  onClick={() => onViewSelect(v.id)}
                  title={v.label}
                  className={`p-2 rounded transition-colors ${
                    activeViewId === v.id 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-slate-100"
          onClick={onDensityToggle}
          title={isCompact ? "Switch to Comfortable" : "Switch to Compact"}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-56 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-full select-none font-sans text-xs text-slate-300">
      <div className="flex flex-col overflow-y-auto flex-1">
        {/* Sidebar Header */}
        <div className="h-12 px-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <span className="font-semibold text-slate-100 tracking-wider uppercase text-[10px]">
            Operating Console
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0 text-slate-400 hover:text-slate-100"
            onClick={onCollapseToggle}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Saved Views Section */}
        <div className="px-2 py-4">
          <div className="flex items-center gap-1.5 px-2 mb-2 text-slate-400 font-semibold tracking-wide uppercase text-[9px]">
            <Bookmark className="h-3 w-3" />
            <span>Saved Views</span>
          </div>
          <div className="flex flex-col gap-0.5">
            {views.map((v) => {
              const Icon = v.icon || Folder;
              const isActive = activeViewId === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => onViewSelect(v.id)}
                  className={`w-full text-left px-3 py-1.5 rounded flex items-center justify-between transition-colors ${
                    isActive 
                      ? 'bg-blue-600/90 text-white font-medium' 
                      : 'hover:bg-slate-800 hover:text-slate-100 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{v.label}</span>
                  </div>
                  {v.count !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {v.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Favorites Section */}
        {favorites.length > 0 && (
          <div className="px-2 py-2 border-t border-slate-800/50">
            <div className="flex items-center gap-1.5 px-2 mb-2 text-slate-400 font-semibold tracking-wide uppercase text-[9px]">
              <Star className="h-3 w-3 fill-slate-400" />
              <span>Favorites</span>
            </div>
            <div className="flex flex-col gap-0.5">
              {favorites.map((fav) => (
                <button
                  key={fav.id}
                  className="w-full text-left px-3 py-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100 rounded truncate"
                >
                  {fav.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Teams Section */}
        {teams.length > 0 && (
          <div className="px-2 py-2 border-t border-slate-800/50">
            <div className="flex items-center gap-1.5 px-2 mb-2 text-slate-400 font-semibold tracking-wide uppercase text-[9px]">
              <Users2 className="h-3 w-3" />
              <span>Teams</span>
            </div>
            <div className="flex flex-col gap-0.5">
              {teams.map((team) => (
                <button
                  key={team.id}
                  className="w-full text-left px-3 py-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100 rounded truncate"
                >
                  {team.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Projects & Sites Section */}
        {projects.length > 0 && (
          <div className="px-2 py-2 border-t border-slate-800/50">
            <div className="flex items-center gap-1.5 px-2 mb-2 text-slate-400 font-semibold tracking-wide uppercase text-[9px]">
              <Pin className="h-3 w-3" />
              <span>Projects & Sites</span>
            </div>
            <div className="flex flex-col gap-0.5">
              {projects.map((proj) => (
                <button
                  key={proj.id}
                  className="w-full text-left px-3 py-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100 rounded truncate"
                >
                  {proj.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Footer Controls */}
      <div className="h-10 border-t border-slate-800 px-3 flex items-center justify-between bg-slate-950">
        <span className="text-[10px] text-slate-500 font-mono">v1.0.0</span>
        <button
          onClick={onDensityToggle}
          className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition-colors"
          title={isCompact ? "Comfortable padding" : "Compact padding"}
        >
          <Settings className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
