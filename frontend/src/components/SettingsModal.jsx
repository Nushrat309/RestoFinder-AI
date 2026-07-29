import React, { useState } from 'react'
import { X, Moon, Sun, Trash2, RotateCcw, Info } from 'lucide-react'

const CITIES = [
  { value: 'all', label: 'All Cities' },
  { value: 'Dhaka', label: 'Dhaka' },
  { value: 'Chattogram', label: 'Chattogram' },
  { value: 'Sylhet', label: 'Sylhet' },
  { value: 'Rajshahi', label: 'Rajshahi' },
  { value: 'Khulna', label: 'Khulna' },
  { value: 'Barishal', label: 'Barishal' },
  { value: 'Rangpur', label: 'Rangpur' },
  { value: 'Mymensingh', label: 'Mymensingh' },
  { value: "Cox's Bazar", label: "Cox's Bazar" },
  { value: 'Cumilla', label: 'Cumilla' },
  { value: 'Bogura', label: 'Bogura' },
  { value: 'Narayanganj', label: 'Narayanganj' },
  { value: 'Gazipur', label: 'Gazipur' },
  { value: 'Jessore', label: 'Jessore' }
]

export default function SettingsModal({
  onClose,
  theme,
  setTheme,
  city,
  setCity,
  maxPrice,
  setMaxPrice,
  onClearChats,
  onResetAll
}) {
  const [confirmClearChats, setConfirmClearChats] = useState(false)
  const [confirmResetAll, setConfirmResetAll] = useState(false)

  const handleClearChats = () => {
    if (confirmClearChats) {
      onClearChats()
      setConfirmClearChats(false)
    } else {
      setConfirmClearChats(true)
    }
  }

  const handleResetAll = () => {
    if (confirmResetAll) {
      onResetAll()
      setConfirmResetAll(false)
    } else {
      setConfirmResetAll(true)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Modal Pane */}
      <div className="bg-bg-secondary border border-border-color w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative z-10 p-6 animate-slide-up flex flex-col gap-5 text-text-primary">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-border-color pb-3">
          <h2 className="text-lg font-extrabold flex items-center gap-2">
            ⚙️ App Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-bg-primary rounded-lg text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="space-y-5 text-sm font-semibold max-h-[70vh] overflow-y-auto pr-1">
          
          {/* Theme Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-text-secondary uppercase tracking-wider">Interface Theme</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 transition-all duration-200
                  ${theme === 'dark' 
                    ? 'border-accent bg-accent/15 text-accent shadow-sm' 
                    : 'border-border-color bg-bg-primary hover:border-text-secondary text-text-secondary hover:text-text-primary'
                  }
                `}
              >
                <Moon size={16} />
                <span>Dark Theme</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 transition-all duration-200
                  ${theme === 'light' 
                    ? 'border-accent bg-accent/15 text-accent shadow-sm' 
                    : 'border-border-color bg-bg-primary hover:border-text-secondary text-text-secondary hover:text-text-primary'
                  }
                `}
              >
                <Sun size={16} />
                <span>Light Theme</span>
              </button>
            </div>
          </div>

          {/* Default City preference */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-text-secondary uppercase tracking-wider">Default Search City</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-bg-primary border border-border-color focus:border-accent outline-none px-3 py-2 rounded-xl text-text-primary text-sm cursor-pointer"
            >
              {CITIES.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Default Budget Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-xs text-text-secondary uppercase tracking-wider">Max Food Price (Budget)</label>
              <span className="text-xs font-bold text-accent">৳ {maxPrice}</span>
            </div>
            <input
              type="range"
              min="50"
              max="2500"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="accent-accent w-full cursor-pointer"
            />
          </div>

          <hr className="border-border-color" />

          {/* Data Management Section */}
          <div className="space-y-3">
            <label className="text-xs text-text-secondary uppercase tracking-wider block">Data & Privacy</label>
            
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleClearChats}
                className={`w-full py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all duration-200
                  ${confirmClearChats 
                    ? 'bg-red-500 text-white border-red-600 hover:bg-red-600 animate-pulse'
                    : 'bg-bg-primary hover:bg-red-500/10 border-border-color hover:border-red-500/30 text-text-secondary hover:text-red-500'
                  }
                `}
              >
                <Trash2 size={14} />
                <span>{confirmClearChats ? 'Confirm: Delete all chat sessions?' : 'Clear Chat History'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetAll}
                className={`w-full py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all duration-200
                  ${confirmResetAll 
                    ? 'bg-red-500 text-white border-red-600 hover:bg-red-600 animate-pulse'
                    : 'bg-bg-primary hover:bg-red-500/10 border-border-color hover:border-red-500/30 text-text-secondary hover:text-red-500'
                  }
                `}
              >
                <RotateCcw size={14} />
                <span>{confirmResetAll ? 'Confirm: Reset all app preferences & favorites?' : 'Reset All App Data'}</span>
              </button>
            </div>
          </div>

          <hr className="border-border-color" />

          {/* About App Box */}
          <div className="bg-bg-primary/50 border border-border-color rounded-xl p-3 flex gap-3 items-start">
            <Info size={16} className="text-accent flex-shrink-0 mt-0.5" />
            <div className="text-xs space-y-1 text-text-secondary font-medium">
              <p className="font-bold text-text-primary">RestoFinder AI v1.2.0</p>
              <p>An intelligent restaurant explorer and menu recommender helper powered by Gemini. Designed with search mapping and chat integration.</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
