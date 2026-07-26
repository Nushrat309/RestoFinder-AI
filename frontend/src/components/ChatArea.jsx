import React, { useRef, useEffect, useState } from 'react'
import { Send, Image, Mic, Copy, Check, RotateCcw } from 'lucide-react'

// Custom parsing function for message bubbles
const parseMessageText = (text, onOpenMenuModal) => {
  if (!text) return null
  
  const lines = text.split('\n')
  return lines.map((line, lineIdx) => {
    const elements = []
    let currentText = line
    let keyIdx = 0

    while (currentText.length > 0) {
      const boldMatch = currentText.match(/\*\*(.*?)\*\*/)
      const menuMatch = currentText.match(/\[Explore Menu:\s*(.*?)\]/)
      const linkMatch = currentText.match(/\[(.*?)\]\((.*?)\)/)

      let firstMatch = null
      let type = ''
      
      if (boldMatch && (!firstMatch || boldMatch.index < firstMatch.index)) {
        firstMatch = boldMatch
        type = 'bold'
      }
      if (menuMatch && (!firstMatch || menuMatch.index < firstMatch.index)) {
        firstMatch = menuMatch
        type = 'menu'
      }
      if (linkMatch && (!firstMatch || linkMatch.index < firstMatch.index)) {
        firstMatch = linkMatch
        type = 'link'
      }

      if (!firstMatch) {
        elements.push(<span key={`text-${lineIdx}-${keyIdx++}`}>{currentText}</span>)
        break
      }

      if (firstMatch.index > 0) {
        elements.push(
          <span key={`text-${lineIdx}-${keyIdx++}`}>
            {currentText.substring(0, firstMatch.index)}
          </span>
        )
      }

      if (type === 'bold') {
        elements.push(
          <strong key={`bold-${lineIdx}-${keyIdx++}`} className="font-extrabold text-text-primary">
            {firstMatch[1]}
          </strong>
        )
      } else if (type === 'menu') {
        const restId = firstMatch[1]
        elements.push(
          <button
            key={`menu-${lineIdx}-${keyIdx++}`}
            onClick={() => onOpenMenuModal(restId)}
            className="mx-1 inline-flex items-center gap-1.5 px-3 py-1 bg-accent/15 border border-accent/25 rounded-lg text-xs font-bold text-accent hover:bg-accent hover:text-white transition-all duration-200 my-0.5"
          >
            📂 Explore Menu
          </button>
        )
      } else if (type === 'link') {
        const linkText = firstMatch[1]
        const linkUrl = firstMatch[2]
        elements.push(
          <a
            key={`link-${lineIdx}-${keyIdx++}`}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mx-0.5 text-accent font-semibold border-b border-dashed border-accent/40 hover:text-accent-hover transition-colors inline-flex items-center gap-0.5"
          >
            🔗 {linkText}
          </a>
        )
      }

      currentText = currentText.substring(firstMatch.index + firstMatch[0].length)
    }

    return (
      <p key={`line-${lineIdx}`} className="mb-1.5 last:mb-0 leading-relaxed text-sm">
        {elements}
      </p>
    )
  })
}

const suggestions = [
  { text: 'Best Kacchi Biryani in Dhaka under ৳400', label: '🍛 Kacchi in Dhaka' },
  { text: 'Pizza spots in Chattogram under ৳600', label: '🍕 Pizza in Chattogram' },
  { text: 'Recommend cafes for working in Sylhet', label: '☕ Cafe in Sylhet' },
  { text: 'Seafood places in Cox\'s Bazar', label: '🏖️ Seafood in Cox\'s Bazar' }
]

export default function ChatArea({
  messages,
  typing,
  onSendMessage,
  onOpenMenuModal
}) {
  const [inputVal, setInputVal] = useState('')
  const [copiedId, setCopiedId] = useState(null)
  const chatContainerRef = useRef(null)

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages, typing])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!inputVal.trim()) return
    onSendMessage(inputVal)
    setInputVal('')
  }

  const handleCopyText = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      
      {/* Messages Scroll Area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scroll-behavior-smooth"
      >
        {messages.length === 0 ? (
          /* Welcome Screen */
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto p-4 animate-fade-in">
            <h2 className="text-3xl font-extrabold tracking-tight mb-2 text-text-primary">
              Discover Restaurants with AI
            </h2>
            <p className="text-sm text-text-secondary mb-8">
              Ask anything about restaurants, food menus, locations, or nearby places in Bangladesh.
            </p>
            
            <div className="grid grid-cols-2 gap-3 w-full">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(s.text)}
                  className="p-3 text-left rounded-2xl bg-bg-secondary border border-border-color hover:border-accent hover:bg-accent/5 text-text-secondary hover:text-text-primary text-xs font-semibold shadow-sm transition-all duration-200"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Chat Message Stream */
          messages.map((msg, idx) => {
            const isUser = msg.role === 'user'
            const msgId = `msg_${idx}`
            
            return (
              <div 
                key={msgId}
                className={`flex items-start gap-3.5 max-w-[85%] animate-fade-in
                  ${isUser ? 'self-end flex-row-reverse ml-auto' : 'self-start mr-auto'}
                `}
              >
                {/* Avatar Icon */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-semibold flex-shrink-0 border
                  ${isUser 
                    ? 'bg-accent/20 border-accent/40 text-accent' 
                    : 'bg-bg-secondary border-border-color text-text-secondary'
                  }
                `}>
                  {isUser ? '👤' : '🤖'}
                </div>

                {/* Message Bubble Panel */}
                <div className="flex flex-col space-y-1">
                  <div className={`px-4.5 py-3.5 rounded-2xl relative shadow-sm border group
                    ${isUser 
                      ? 'bg-gradient-to-r from-accent to-[#ff4b1f] text-white border-transparent rounded-tr-sm' 
                      : 'bg-bg-secondary text-text-primary border-border-color rounded-tl-sm'
                    }
                  `}>
                    
                    {/* Rendered Text Chunks */}
                    {parseMessageText(msg.text, onOpenMenuModal)}

                    {/* Quick Assistant Actions (Copy / Regenerate) */}
                    {!isUser && (
                      <div className="absolute right-2 bottom-[-24px] opacity-0 group-hover:opacity-100 flex items-center gap-1.5 bg-bg-secondary border border-border-color rounded-lg p-0.5 shadow-md transition-opacity duration-200">
                        <button
                          onClick={() => handleCopyText(msg.text, msgId)}
                          className="p-1 hover:bg-bg-primary rounded-md text-text-muted hover:text-text-primary transition-colors"
                          title="Copy response"
                        >
                          {copiedId === msgId ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                        </button>
                        <button
                          onClick={() => {
                            // Find the last user message to regenerate
                            const userMsgs = messages.filter(m => m.role === 'user')
                            if (userMsgs.length > 0) {
                              onSendMessage(userMsgs[userMsgs.length - 1].text)
                            }
                          }}
                          className="p-1 hover:bg-bg-primary rounded-md text-text-muted hover:text-text-primary transition-colors"
                          title="Regenerate response"
                        >
                          <RotateCcw size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Message Timestamp */}
                  <span className={`text-[10px] text-text-muted px-1.5 ${isUser ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            )
          })
        )}

        {/* Typing Indicator */}
        {typing && (
          <div className="flex items-start gap-3.5 max-w-[85%] self-start animate-fade-in mr-auto">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm bg-bg-secondary border border-border-color text-text-secondary flex-shrink-0">
              🤖
            </div>
            <div className="px-4.5 py-3 bg-bg-secondary text-text-primary border border-border-color rounded-2xl rounded-tl-sm shadow-sm">
              <div className="flex items-center gap-1 py-1">
                <span className="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '-0.32s' }}></span>
                <span className="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '-0.16s' }}></span>
                <span className="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggestion Chips (when user is chatting but want quick ideas) */}
      {messages.length > 0 && (
        <div className="flex gap-2 px-6 py-2 overflow-x-auto whitespace-nowrap scrollbar-none">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => onSendMessage(s.text)}
              className="bg-bg-secondary/40 border border-border-color hover:border-accent hover:bg-accent/5 text-text-secondary hover:text-text-primary text-[11px] font-semibold py-1.5 px-3 rounded-full transition-all duration-200"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Fixed Bottom Input Area */}
      <footer className="p-4 border-t border-border-color bg-bg-secondary/30 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-3xl mx-auto w-full relative">
          
          {/* Attachment placeholder button */}
          <button 
            type="button"
            className="p-3 bg-bg-secondary border border-border-color rounded-xl text-text-muted hover:text-text-primary hover:border-accent transition-all duration-200"
            title="Attachment (Placeholder)"
          >
            <Image size={18} />
          </button>
          
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type area, dish (e.g. Kacchi, Burger), budget..."
            className="flex-1 bg-bg-secondary border border-border-color text-text-primary py-3 px-4 rounded-xl text-sm outline-none focus:border-accent/60 transition-all duration-200 placeholder-text-muted"
            autoComplete="off"
            required
          />

          {/* Voice placeholder button */}
          <button 
            type="button"
            className="p-3 bg-bg-secondary border border-border-color rounded-xl text-text-muted hover:text-text-primary hover:border-accent transition-all duration-200"
            title="Voice input (Placeholder)"
          >
            <Mic size={18} />
          </button>

          {/* Send Submit Button */}
          <button
            type="submit"
            className="p-3 bg-gradient-to-r from-accent to-[#ff4b1f] hover:opacity-95 text-white rounded-xl shadow-lg hover:shadow-glow hover:-translate-y-[1px] active:translate-y-0 transition-all duration-200"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>

        </form>
      </footer>

    </div>
  )
}
