import React, { useState } from 'react'
import { Menu, Sun, Moon, LogIn, User, LogOut, MessageSquare, Map } from 'lucide-react'

export default function TopNav({
  theme,
  setTheme,
  user,
  onLogout,
  onOpenAuth,
  mobilePane,
  setMobilePane,
  onToggleSidebar
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="px-6 py-4 flex justify-between items-center border-b border-border-color bg-bg-secondary/40 backdrop-blur-md z-20">
      
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2.5 rounded-xl bg-bg-primary/50 hover:bg-bg-primary border border-border-color text-text-secondary hover:text-text-primary transition-all duration-200"
          title="Toggle Sidebar"
        >
          <Menu size={16} />
        </button>

        <span className="text-xl bg-accent/10 border border-accent/25 p-2 rounded-xl">
          🍽️
        </span>
        <div className="hidden sm:block">
          <h1 className="text-base font-extrabold tracking-tight">
            RestoFinder <span className="bg-gradient-to-r from-accent to-[#ff4b1f] bg-clip-text text-transparent">AI</span>
          </h1>
          <p className="text-[10px] text-text-secondary font-medium tracking-wide">
            Restaurant & Food Explorer
          </p>
        </div>
      </div>

      {/* Mobile navigation tab switches (Hidden on Desktop) */}
      <div className="flex md:hidden bg-bg-primary/60 border border-border-color p-1 rounded-xl gap-1">
        <button
          onClick={() => setMobilePane('chat')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
            ${mobilePane === 'chat' 
              ? 'bg-bg-secondary text-accent shadow-sm' 
              : 'text-text-secondary hover:text-text-primary'
            }
          `}
        >
          <MessageSquare size={13} />
          <span>AI Chat</span>
        </button>
        
        <button
          onClick={() => setMobilePane('explorer')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
            ${mobilePane === 'explorer' 
              ? 'bg-bg-secondary text-accent shadow-sm' 
              : 'text-text-secondary hover:text-text-primary'
            }
          `}
        >
          <Map size={13} />
          <span>Explorer</span>
        </button>
      </div>

      {/* Action Area (Theme, Login, Avatar Dropdown) */}
      <div className="flex items-center gap-3">
        
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-bg-primary/50 hover:bg-bg-primary border border-border-color text-text-secondary hover:text-text-primary transition-all duration-200"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* User Account Controls */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-bg-primary/50 border border-border-color hover:border-accent transition-all duration-200"
            >
              <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-base font-bold text-accent">
                {user.avatar_url || '👤'}
              </div>
              <span className="hidden sm:inline text-sm font-semibold truncate max-w-[80px]">
                {user.name}
              </span>
            </button>

            {dropdownOpen && (
              <>
                {/* Backdrop handler to close dropdown */}
                <div 
                  onClick={() => setDropdownOpen(false)} 
                  className="fixed inset-0 z-30"
                />
                
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-bg-secondary border border-border-color shadow-2xl p-2 z-40 animate-fade-in">
                  <div className="px-3 py-2 border-b border-border-color mb-1">
                    <p className="text-xs text-text-secondary">Logged in as</p>
                    <p className="text-sm font-bold truncate text-text-primary">{user.email}</p>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setDropdownOpen(false)
                      onOpenAuth('profile')
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-primary/50 transition-colors"
                  >
                    <User size={15} />
                    <span>Edit Profile</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      setDropdownOpen(false)
                      onLogout()
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={15} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={() => onOpenAuth('login')}
            className="flex items-center gap-1.5 bg-accent/10 border border-accent/20 hover:bg-accent hover:text-white hover:border-transparent text-accent text-sm font-bold py-2 px-4 rounded-xl transition-all duration-200"
          >
            <LogIn size={15} />
            <span>Login</span>
          </button>
        )}
      </div>

    </header>
  )
}
