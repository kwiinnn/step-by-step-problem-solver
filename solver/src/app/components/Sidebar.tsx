import React, { useState, useRef, useEffect } from 'react';
import { Plus, FileText, MoreVertical, Edit2, Trash2, Check, X, PanelLeftClose } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export interface Tab {
  id: string;
  name: string;
}

interface SidebarProps {
  tabs: Tab[];
  activeTabId: string;
  isOpen: boolean;
  onSelectTab: (id: string) => void;
  onAddTab: () => void;
  onDeleteTab: (id: string) => void;
  onRenameTab: (id: string, newName: string) => void;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  tabs,
  activeTabId,
  isOpen,
  onSelectTab,
  onAddTab,
  onDeleteTab,
  onRenameTab,
  onClose,
}) => {
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTabId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingTabId]);

  const handleStartEdit = (tab: Tab, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTabId(tab.id);
    setEditValue(tab.name);
    setMenuOpenId(null);
  };

  const handleSaveEdit = () => {
    if (editingTabId && editValue.trim()) {
      onRenameTab(editingTabId, editValue.trim());
    }
    setEditingTabId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveEdit();
    if (e.key === 'Escape') setEditingTabId(null);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setMenuOpenId(null);
    if (menuOpenId) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuOpenId]);

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.aside 
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 256, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          className="border-r border-neutral-800 bg-[#09090b] flex flex-col shrink-0 overflow-hidden"
        >
          <div className="w-64 h-full flex flex-col min-w-[16rem]">
            <div className="p-4 flex items-center justify-between text-neutral-400 shrink-0">
              <span className="text-sm font-medium uppercase tracking-wider text-neutral-500">Tabs</span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={onAddTab}
                  className="p-1 hover:bg-neutral-800 rounded-md transition-colors text-neutral-400 hover:text-white"
                  title="New Tab"
                >
                  <Plus size={18} />
                </button>
                {onClose && (
                  <button 
                    onClick={onClose}
                    className="p-1 hover:bg-neutral-800 rounded-md transition-colors text-neutral-400 hover:text-white"
                    title="Close Sidebar"
                  >
                    <PanelLeftClose size={18} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-4">
              {tabs.map((tab) => {
                const isActive = tab.id === activeTabId;
                const isEditing = tab.id === editingTabId;

                return (
                  <div
                    key={tab.id}
                    onClick={() => !isEditing && onSelectTab(tab.id)}
                    className={cn(
                      "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors",
                      isActive 
                        ? "bg-indigo-500/10 text-indigo-400" 
                        : "text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200"
                    )}
                  >
                    <FileText size={18} className={cn("shrink-0", isActive ? "text-indigo-400" : "text-neutral-500")} />
                    
                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-1 min-w-0" onClick={e => e.stopPropagation()}>
                        <input
                          ref={editInputRef}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          onBlur={handleSaveEdit}
                          className="w-full bg-neutral-900 border border-indigo-500/50 rounded px-2 py-0.5 text-sm text-neutral-200 outline-none"
                        />
                      </div>
                    ) : (
                      <span className="flex-1 truncate text-sm font-medium">
                        {tab.name}
                      </span>
                    )}

                    {!isEditing && (
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(menuOpenId === tab.id ? null : tab.id);
                          }}
                          className={cn(
                            "p-1 rounded-md hover:bg-neutral-700/50 transition-colors opacity-0 group-hover:opacity-100",
                            menuOpenId === tab.id && "opacity-100 bg-neutral-700/50"
                          )}
                        >
                          <MoreVertical size={16} />
                        </button>

                        {menuOpenId === tab.id && (
                          <div className="absolute right-0 top-full mt-1 w-32 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl overflow-hidden z-50 py-1">
                            <button
                              onClick={(e) => handleStartEdit(tab, e)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800 transition-colors text-left"
                            >
                              <Edit2 size={14} /> Rename
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteTab(tab.id);
                                setMenuOpenId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 transition-colors text-left"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

