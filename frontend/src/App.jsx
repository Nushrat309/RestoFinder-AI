import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import TopNav from './components/TopNav'
import ChatArea from './components/ChatArea'
import ExplorerPane from './components/ExplorerPane'
import MenuModal from './components/MenuModal'
import AuthModal from './components/AuthModal'
import SettingsModal from './components/SettingsModal'
import HelpFAQModal from './components/HelpFAQModal'

const BASE_URL = 'http://localhost:8000'

export default function App() {
  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  // Auth state
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('restofinder_user')
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [authModalMode, setAuthModalMode] = useState(null) // 'login' | 'signup' | 'profile' | null
  
  // Explorer View state: 'map', 'restaurants', 'food', 'favorites'
  const [activeTab, setActiveTab] = useState('map')
  
  // Mobile pane toggle: 'chat' | 'explorer'
  const [mobilePane, setMobilePane] = useState('chat')
  
  // Restaurant Details Modal
  const [selectedRestId, setSelectedRestId] = useState(null)
  
  // Settings & Help Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  
  // Restaurants database cache
  const [restaurants, setRestaurants] = useState([])
  const [isLoadingRest, setIsLoadingRest] = useState(true)
  const [loadError, setLoadError] = useState(false)
  
  // Search & Filters state
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('all')
  const [location, setLocation] = useState('all')
  const [cuisine, setCuisine] = useState('all')
  const [maxPrice, setMaxPrice] = useState(1500)
  const [vegOnly, setVegOnly] = useState(false)
  const [glutenFree, setGlutenFree] = useState(false)
  const [inStock, setInStock] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')
  
  // Favorites state
  const [favorites, setFavorites] = useState(() => {
    const favs = localStorage.getItem('restofinder_favs')
    return favs ? JSON.parse(favs) : { restaurants: [], items: [] }
  })
  
  // Chat state
  const [chatHistory, setChatHistory] = useState([
    {
      id: 'default',
      title: 'Welcome Conversation',
      messages: [
        {
          role: 'assistant',
          text: 'Welcome! I am **RestoFinder AI**, your Restaurant & Food Assistant. Ask me for recommendations like *"Best Kacchi Biryani under ৳400 in Dhaka"* or search restaurants on the interactive Map! 🗺️🍔🍛 sushi',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    }
  ])
  const [activeChatId, setActiveChatId] = useState('default')
  const [typing, setTyping] = useState(false)
  
  // Sync theme with body class
  useEffect(() => {
    const root = window.document.documentElement
    const body = window.document.body
    if (theme === 'light') {
      root.classList.remove('dark')
      root.classList.add('light')
      body.classList.remove('dark-theme')
      body.classList.add('light-theme')
    } else {
      root.classList.remove('light')
      root.classList.add('dark')
      body.classList.remove('light-theme')
      body.classList.add('dark-theme')
    }
    localStorage.setItem('theme', theme)
  }, [theme])
  
  // Fetch restaurants
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`${BASE_URL}/api/restaurants`)
        if (!res.ok) throw new Error('Failed to load')
        const data = await res.json()
        setRestaurants(data)
        setIsLoadingRest(false)
      } catch (err) {
        console.error('Error fetching restaurants:', err)
        setIsLoadingRest(false)
        setLoadError(true)
      }
    }
    loadData()
  }, [])
  
  // Save favorites to localStorage
  const saveFavorites = (newFavs) => {
    setFavorites(newFavs)
    localStorage.setItem('restofinder_favs', JSON.stringify(newFavs))
  }
  
  const toggleFavoriteRestaurant = (id) => {
    const newFavs = { ...favorites }
    const index = newFavs.restaurants.indexOf(id)
    if (index === -1) {
      newFavs.restaurants.push(id)
    } else {
      newFavs.restaurants.splice(index, 1)
    }
    saveFavorites(newFavs)
  }
  
  const toggleFavoriteItem = (itemId) => {
    const newFavs = { ...favorites }
    const index = newFavs.items.indexOf(itemId)
    if (index === -1) {
      newFavs.items.push(itemId)
    } else {
      newFavs.items.splice(index, 1)
    }
    saveFavorites(newFavs)
  }
  
  const isFavoriteRestaurant = (id) => favorites.restaurants.includes(id)
  const isFavoriteItem = (id) => favorites.items.includes(id)
  
  // Filter Restaurants
  const getFilteredRestaurants = () => {
    const q = query.trim().toLowerCase()
    
    return restaurants.filter(rest => {
      // City Filter
      if (city !== 'all' && rest.city && rest.city.toLowerCase() !== city.toLowerCase()) {
        return false
      }
      
      // Location Filter
      if (location !== 'all' && (rest.location || rest.area) !== location) {
        return false
      }
      
      // Cuisine Filter
      if (cuisine !== 'all' && !rest.cuisine.toLowerCase().includes(cuisine.toLowerCase())) {
        return false
      }
      
      // Category and tags check on menu items
      const matchesCategoryAndTags = rest.menu.some(item => {
        const matchesCat = activeCategory === 'all' || 
          item.category.toLowerCase().includes(activeCategory.toLowerCase())
        const matchesPrice = item.price <= maxPrice
        const matchesVeg = !vegOnly || item.dietary_tags.includes('Veg')
        const matchesGf = !glutenFree || item.dietary_tags.includes('Gluten-Free')
        const matchesStock = !inStock || item.available
        
        return matchesCat && matchesPrice && matchesVeg && matchesGf && matchesStock
      })
      
      if (!matchesCategoryAndTags) return false
      
      // Query search matching
      if (q) {
        const matchesRestInfo = rest.name.toLowerCase().includes(q) ||
          rest.cuisine.toLowerCase().includes(q) ||
          (rest.location || rest.area || '').toLowerCase().includes(q) ||
          (rest.city || '').toLowerCase().includes(q)
        
        const matchesMenu = rest.menu.some(item => 
          item.name.toLowerCase().includes(q) || 
          item.category.toLowerCase().includes(q)
        )
        
        if (!matchesRestInfo && !matchesMenu) return false
      }
      
      return true
    })
  }
  
  const filteredRestaurants = getFilteredRestaurants()
  
  // Chat handlers
  const currentChat = chatHistory.find(c => c.id === activeChatId) || chatHistory[0]
  
  const handleSendMessage = async (text) => {
    if (!text.trim()) return
    
    // Create new message objects
    const userMsg = {
      role: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    
    // Update local chat messages
    const updatedChats = chatHistory.map(chat => {
      if (chat.id === activeChatId) {
        return {
          ...chat,
          messages: [...chat.messages, userMsg]
        }
      }
      return chat
    })
    setChatHistory(updatedChats)
    setTyping(true)
    
    // Prepare history payload for API (role: 'user' / 'model', parts: [{text: ...}])
    const activeChat = updatedChats.find(c => c.id === activeChatId)
    const apiContents = activeChat.messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }))
    
    try {
      const res = await fetch(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: apiContents })
      })
      
      if (!res.ok) {
        let errorMsg = `Server error (status: ${res.status})`
        try {
          const errData = await res.json()
          errorMsg = errData.detail || errorMsg
        } catch (_) {}
        throw new Error(errorMsg)
      }
      
      // Initialize empty message for streaming
      const assistantMsg = {
        role: 'assistant',
        text: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      
      setChatHistory(prev => prev.map(chat => {
        if (chat.id === activeChatId) {
          let title = chat.title
          if (title === 'New Chat' || title === 'Welcome Conversation') {
            title = text.length > 25 ? text.substring(0, 25) + '...' : text
          }
          return {
            ...chat,
            title,
            messages: [...chat.messages, assistantMsg]
          }
        }
        return chat
      }))

      const reader = res.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let buffer = ''
      let accumulatedText = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (trimmed.startsWith('data: ')) {
            const jsonStr = trimmed.slice(6)
            if (!jsonStr) continue
            try {
              const data = JSON.parse(jsonStr)
              if (data.error) {
                throw new Error(data.error)
              }
              if (data.token) {
                accumulatedText += data.token
                
                setChatHistory(prev => prev.map(chat => {
                  if (chat.id === activeChatId) {
                    const msgs = [...chat.messages]
                    if (msgs.length > 0) {
                      msgs[msgs.length - 1] = {
                        ...msgs[msgs.length - 1],
                        text: accumulatedText
                      }
                    }
                    return {
                      ...chat,
                      messages: msgs
                    }
                  }
                  return chat
                }))
              }
            } catch (parseErr) {
              if (parseErr.message && (parseErr.message.includes('Quota') || parseErr.message.includes('Service Error'))) {
                throw parseErr
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      let displayError = error.message
      if (error.message.includes('Failed to fetch')) {
        displayError = 'Connection error: Unable to connect to backend server. Make sure FastAPI server runs on port 8000.'
      }
      
      const errorMsg = {
        role: 'assistant',
        text: `⚠️ **Error**: ${displayError}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      
      setChatHistory(prev => prev.map(chat => {
        if (chat.id === activeChatId) {
          const msgs = [...chat.messages]
          if (msgs.length > 0 && msgs[msgs.length - 1].role === 'assistant' && msgs[msgs.length - 1].text === '') {
            msgs[msgs.length - 1] = errorMsg
          } else {
            msgs.push(errorMsg)
          }
          return {
            ...chat,
            messages: msgs
          }
        }
        return chat
      }))
    } finally {
      setTyping(false)
    }
  }
  
  const handleStartNewChat = () => {
    const newId = `chat_${Date.now()}`
    const newChatObj = {
      id: newId,
      title: 'New Chat',
      messages: []
    }
    setChatHistory(prev => [...prev, newChatObj])
    setActiveChatId(newId)
    setMobilePane('chat')
  }
  
  const handleDeleteChat = (id, event) => {
    event?.stopPropagation()
    const filtered = chatHistory.filter(c => c.id !== id)
    if (filtered.length === 0) {
      const defaultChat = {
        id: 'default',
        title: 'Welcome Conversation',
        messages: [
          {
            role: 'assistant',
            text: 'Welcome! I am **RestoFinder AI**, your Restaurant & Food Assistant. Ask me for recommendations like *"Best Kacchi Biryani under ৳400 in Dhaka"* or search restaurants on the interactive map! 🗺️🍔🍛',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      }
      setChatHistory([defaultChat])
      setActiveChatId('default')
    } else {
      setChatHistory(filtered)
      if (activeChatId === id) {
        setActiveChatId(filtered[0].id)
      }
    }
  }
  
  const handleSelectChat = (id) => {
    setActiveChatId(id)
    setMobilePane('chat')
  }
  
  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('restofinder_user')
  }

  const handleClearChats = () => {
    const defaultChat = {
      id: 'default',
      title: 'Welcome Conversation',
      messages: [
        {
          role: 'assistant',
          text: 'Welcome! I am **RestoFinder AI**, your Restaurant & Food Assistant. Ask me for recommendations like *"Best Kacchi Biryani under ৳400 in Dhaka"* or search restaurants on the interactive Map! 🗺️🍔🍛',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    }
    setChatHistory([defaultChat])
    setActiveChatId('default')
  }

  const handleResetAll = () => {
    localStorage.removeItem('theme')
    localStorage.removeItem('restofinder_user')
    localStorage.removeItem('restofinder_favs')
    setTheme('dark')
    setUser(null)
    setFavorites({ restaurants: [], items: [] })
    setCity('all')
    setLocation('all')
    setCuisine('all')
    setMaxPrice(1500)
    setVegOnly(false)
    setGlutenFree(false)
    setInStock(false)
    setActiveCategory('all')
    handleClearChats()
    setIsSettingsOpen(false)
  }
  
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-bg-primary text-text-primary transition-all duration-300">
      {/* Top Header Navigation */}
      <TopNav 
        theme={theme} 
        setTheme={setTheme} 
        user={user} 
        onLogout={handleLogout}
        onOpenAuth={(mode) => setAuthModalMode(mode)}
        mobilePane={mobilePane}
        setMobilePane={setMobilePane}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex flex-1 overflow-hidden w-full relative">
        {/* Collapsible Left Sidebar */}
        <Sidebar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          chatHistory={chatHistory}
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          onNewChat={handleStartNewChat}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
        />
        
        {/* Main Workspace (Split Pane layout) */}
        <div className="flex-1 flex overflow-hidden w-full h-full relative">
          
          {/* Left Pane: Chat (Toggled on mobile) */}
          <div className={`flex-[4.5] border-r border-border-color h-full flex flex-col bg-[#0f121d]/5 
            ${mobilePane === 'chat' ? 'flex' : 'hidden'} md:flex`}
          >
            <ChatArea 
              messages={currentChat?.messages || []}
              typing={typing}
              onSendMessage={handleSendMessage}
              onOpenMenuModal={setSelectedRestId}
            />
          </div>
          
          {/* Right Pane: Map & Explorer (Toggled on mobile) */}
          <div className={`flex-[5.5] h-full flex flex-col bg-[#0f121d]/15 p-5 md:p-6 overflow-y-auto
            ${mobilePane === 'explorer' ? 'flex' : 'hidden'} md:flex`}
          >
            <ExplorerPane 
              theme={theme}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              restaurants={restaurants}
              filteredRestaurants={filteredRestaurants}
              isLoading={isLoadingRest}
              loadError={loadError}
              favorites={favorites}
              isFavoriteRestaurant={isFavoriteRestaurant}
              toggleFavoriteRestaurant={toggleFavoriteRestaurant}
              isFavoriteItem={isFavoriteItem}
              toggleFavoriteItem={toggleFavoriteItem}
              onExploreMenu={setSelectedRestId}
              
              // Filter values & setters
              query={query} setQuery={setQuery}
              city={city} setCity={setCity}
              location={location} setLocation={setLocation}
              cuisine={cuisine} setCuisine={setCuisine}
              maxPrice={maxPrice} setMaxPrice={setMaxPrice}
              vegOnly={vegOnly} setVegOnly={setVegOnly}
              glutenFree={glutenFree} setGlutenFree={setGlutenFree}
              inStock={inStock} setInStock={setInStock}
              activeCategory={activeCategory} setActiveCategory={setActiveCategory}
            />
          </div>
          
        </div>
      </div>
      
      {/* Restaurant Details Menu Modal */}
      {selectedRestId && (
        <MenuModal 
          restaurantId={selectedRestId}
          restaurants={restaurants}
          isFavoriteRestaurant={isFavoriteRestaurant}
          toggleFavoriteRestaurant={toggleFavoriteRestaurant}
          isFavoriteItem={isFavoriteItem}
          toggleFavoriteItem={toggleFavoriteItem}
          onClose={() => setSelectedRestId(null)}
        />
      )}
      
      {/* Authentication Modal */}
      {authModalMode && (
        <AuthModal 
          mode={authModalMode}
          onClose={() => setAuthModalMode(null)}
          onSuccess={(userData) => {
            setUser(userData)
            localStorage.setItem('restofinder_user', JSON.stringify(userData))
            setAuthModalMode(null)
          }}
          user={user}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal 
          onClose={() => setIsSettingsOpen(false)}
          theme={theme}
          setTheme={setTheme}
          city={city}
          setCity={(val) => {
            setCity(val)
            setLocation('all')
          }}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          onClearChats={handleClearChats}
          onResetAll={handleResetAll}
        />
      )}

      {/* Help & FAQ Modal */}
      {isHelpOpen && (
        <HelpFAQModal 
          onClose={() => setIsHelpOpen(false)}
        />
      )}
    </div>
  )
}
