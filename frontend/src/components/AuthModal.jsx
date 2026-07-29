import React, { useState } from 'react'
import { X, User, Mail, Lock } from 'lucide-react'

const AVATAR_OPTIONS = ['🍕', '🍔', '🍛', '☕', '🧁', '🥩', '🍣', '🌶️']

export default function AuthModal({
  mode,
  onClose,
  onSuccess,
  user
}) {
  const [activeTab, setActiveTab] = useState(mode === 'profile' ? 'profile' : mode) // 'login' | 'signup' | 'profile'
  const [name, setName] = useState(user ? user.name : '')
  const [email, setEmail] = useState(user ? user.email : '')
  const [password, setPassword] = useState('')
  const [avatar, setAvatar] = useState(user ? user.avatar_url : '🍕')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (activeTab === 'login') {
      if (!email.trim() || !password.trim()) {
        setErrorMsg('Please enter both email and password.')
        return
      }
      // Simulate successful login
      onSuccess({
        name: email.split('@')[0],
        email: email,
        avatar_url: avatar
      })
    } else if (activeTab === 'signup') {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setErrorMsg('Please fill out all fields.')
        return
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.')
        return
      }
      // Simulate successful sign up
      onSuccess({
        name: name,
        email: email,
        avatar_url: avatar
      })
    } else if (activeTab === 'profile') {
      if (!name.trim() || !email.trim()) {
        setErrorMsg('Name and email cannot be empty.')
        return
      }
      // Simulate profile update
      onSuccess({
        ...user,
        name: name,
        email: email,
        avatar_url: avatar
      })
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
      <div className="bg-bg-secondary border border-border-color w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative z-10 p-6 animate-slide-up flex flex-col gap-4">
        
        {/* Header navigation */}
        <div className="flex justify-between items-center border-b border-border-color pb-3">
          {activeTab === 'profile' ? (
            <h2 className="text-lg font-extrabold text-text-primary">Edit User Profile</h2>
          ) : (
            <div className="flex gap-4">
              <button
                onClick={() => { setActiveTab('login'); setErrorMsg('') }}
                className={`text-lg font-extrabold pb-1 border-b-2 transition-all
                  ${activeTab === 'login' ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'}
                `}
              >
                Login
              </button>
              <button
                onClick={() => { setActiveTab('signup'); setErrorMsg('') }}
                className={`text-lg font-extrabold pb-1 border-b-2 transition-all
                  ${activeTab === 'signup' ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'}
                `}
              >
                Sign Up
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-bg-primary rounded-lg text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Error messaging */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/35 text-red-500 text-xs font-semibold px-3 py-2 rounded-xl">
            {errorMsg}
          </div>
        )}

        {/* Input Forms */}
        <form onSubmit={handleSubmit} className="space-y-4 text-sm font-semibold">
          
          {/* Name Field (for signup/profile) */}
          {activeTab !== 'login' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-text-secondary">Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full bg-bg-primary border border-border-color focus:border-accent outline-none pl-9 pr-3 py-2 rounded-xl text-text-primary"
                  required
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-text-secondary">Email Address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-bg-primary border border-border-color focus:border-accent outline-none pl-9 pr-3 py-2 rounded-xl text-text-primary"
                required
              />
            </div>
          </div>

          {/* Password (for login/signup) */}
          {activeTab !== 'profile' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-text-secondary">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="******"
                  className="w-full bg-bg-primary border border-border-color focus:border-accent outline-none pl-9 pr-3 py-2 rounded-xl text-text-primary"
                  required
                />
              </div>
            </div>
          )}

          {/* Theme Avatar Selector (for signup/profile) */}
          {activeTab !== 'login' && (
            <div className="flex flex-col gap-2 pt-1">
              <label className="text-xs text-text-secondary">Choose Food Avatar</label>
              <div className="grid grid-cols-8 gap-2">
                {AVATAR_OPTIONS.map(char => (
                  <button
                    key={char}
                    type="button"
                    onClick={() => setAvatar(char)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-lg border transition-all duration-200
                      ${avatar === char 
                        ? 'border-accent bg-accent/15 scale-110 shadow-sm' 
                        : 'border-border-color bg-bg-primary hover:border-text-secondary'
                      }
                    `}
                  >
                    {char}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-accent to-[#ff4b1f] hover:opacity-95 text-white py-2.5 rounded-xl font-bold transition-all duration-200 mt-2 shadow-sm"
          >
            {activeTab === 'login' ? 'Sign In' : activeTab === 'signup' ? 'Create Account' : 'Save Changes'}
          </button>

        </form>

      </div>
    </div>
  )
}
