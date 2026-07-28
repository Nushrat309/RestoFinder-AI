import React from 'react'
import { Plus, MessageSquare, Trash2, Settings, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react'

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  chatHistory,
  activeChatId,
  onSelectChat,
  onDeleteChat,
  onNewChat,
  onOpenSettings,
  onOpenHelp
}) {
  return (
    <>
      {/* Desktop Sidebar Toggle Tab (when sidebar is closed) */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-40 bg-bg-secondary border border-border-color hover:border-accent p-2 rounded-full shadow-md text-text-secondary hover:text-text-primary transition-all duration-300"
          title="Open Sidebar"
        >
          <ChevronRight size={18} />
        </button>
      )}

      {/* Sidebar Container */}
      <div 
        className={`bg-bg-secondary border-r border-border-color h-full flex flex-col transition-all duration-300 z-30 relative
          ${sidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:w-0 overflow-hidden'}
          ${sidebarOpen ? 'absolute md:relative left-0 top-0 bottom-0 shadow-2xl md:shadow-none' : 'absolute md:relative'}
        `}
      >
        {/* Header with New Chat & Collapse button */}
        <div className="p-4 flex items-center justify-between gap-2 border-b border-border-color">
          <button
            onClick={onNewChat}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-accent to-[#ff4b1f] hover:opacity-95 text-white py-2 px-4 rounded-xl text-sm font-semibold shadow-sm transition-all duration-200"
          >
            <Plus size={16} />
            <span>New Chat</span>
          </button>
          
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-bg-primary rounded-xl text-text-secondary hover:text-text-primary transition-colors"
            title="Collapse Sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Scrollable Chat History List */}
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
          <div className="text-[10px] uppercase tracking-wider font-bold text-text-muted px-3 mb-2">
            Recent Conversations
          </div>
          
          {chatHistory.map((chat) => {
            const isActive = chat.id === activeChatId
            return (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`group flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl cursor-pointer text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-accent/15 text-accent border border-accent/20' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-primary/50 border border-transparent'
                  }
                `}
              >
                <div className="flex items-center gap-2 overflow-hidden truncate">
                  <MessageSquare size={15} className={isActive ? 'text-accent' : 'text-text-muted group-hover:text-text-secondary'} />
                  <span className="truncate">{chat.title}</span>
                </div>
                
                <button
                  onClick={(e) => onDeleteChat(chat.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-bg-primary rounded-md text-text-muted hover:text-red-500 transition-all duration-150"
                  title="Delete conversation"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )
          })}

          {/* Saved Chats Placeholder */}
          <div className="pt-6">
            <div className="text-[10px] uppercase tracking-wider font-bold text-text-muted px-3 mb-2">
              Saved Collections (Future)
            </div>
            <div className="text-xs text-text-muted px-3 italic">
              No saved folders yet.
            </div>
          </div>
        </div>

        {/* Footer Settings & Options */}
        <div className="p-3 border-t border-border-color space-y-1 bg-bg-secondary">
          <button 
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-primary/50 transition-colors"
          >
            <Settings size={16} />
            <span>Settings</span>
          </button>
          
          <button 
            onClick={onOpenHelp}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-primary/50 transition-colors"
          >
            <HelpCircle size={16} />
            <span>Help & FAQ</span>
          </button>
        </div>
      </div>
      
      {/* Background overlay for mobile view (when sidebar is active) */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 z-20 backdrop-blur-sm"
        />
      )}
    </>
  )
}
