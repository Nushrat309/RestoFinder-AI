import React, { useState } from 'react'
import { X, ChevronDown, ChevronUp, HelpCircle, Lightbulb, Compass } from 'lucide-react'

const FAQS = [
  {
    question: "How do I search for restaurants in specific cities or areas?",
    answer: "Click on the 'Filters' button next to the search bar. You can choose a specific city (e.g. Dhaka) and a corresponding local area (e.g. Gulshan, Banani). You can also type directly into the main search bar to match names, cuisines, or locations."
  },
  {
    question: "How does the interactive map view work?",
    answer: "The 'Map View' tab dynamically updates markers to show restaurants matching your search filters. Click any marker to see details and click the 'Explore Menu' button in the popup to browse the restaurant's dishes."
  },
  {
    question: "How does the RestoFinder AI Assistant help me?",
    answer: "You can ask our AI helper for recommendations in natural language. For example, try: 'Recommend Kacchi Biryani under ৳400 in Dhaka' or 'Where is the best burger place in Uttara?'. The assistant will write back suggestions and automatically highlight restaurant links you can click to inspect."
  },
  {
    question: "How do I save my favorite food items and restaurants?",
    answer: "Click the heart button on the top-right of any restaurant card, or click the emoji symbol on food items to save them. You can view and manage all of them under the 'Favorites' tab in the Explorer Pane."
  },
  {
    question: "Where is my chat history saved, and can I delete it?",
    answer: "Your conversation history is stored locally and visible in the left sidebar. You can delete specific chat logs using the trash bin button next to each item, or clear all chats from the App Settings modal."
  },
  {
    question: "Can I customize my profile and avatar?",
    answer: "Yes! Click the avatar icon or 'Login' in the top nav bar to sign up, log in, or update your profile details including choosing your favorite food avatar (🍕, 🍔, 🍛, etc.)."
  }
]

export default function HelpFAQModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('faq') // 'faq' | 'tips'
  const [expandedFaqIndex, setExpandedFaqIndex] = useState(null)

  const toggleFaq = (index) => {
    if (expandedFaqIndex === index) {
      setExpandedFaqIndex(null)
    } else {
      setExpandedFaqIndex(index)
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
      <div className="bg-bg-secondary border border-border-color w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative z-10 p-6 animate-slide-up flex flex-col gap-5 text-text-primary">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-border-color pb-3">
          <h2 className="text-lg font-extrabold flex items-center gap-2">
            💡 Help & Support
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-bg-primary rounded-lg text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-bg-primary p-1 rounded-xl gap-1">
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2
              ${activeTab === 'faq' 
                ? 'bg-bg-secondary border border-border-color text-accent shadow-sm' 
                : 'text-text-secondary hover:text-text-primary'
              }
            `}
          >
            <HelpCircle size={14} />
            <span>FAQs Accordion</span>
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2
              ${activeTab === 'tips' 
                ? 'bg-bg-secondary border border-border-color text-accent shadow-sm' 
                : 'text-text-secondary hover:text-text-primary'
              }
            `}
          >
            <Lightbulb size={14} />
            <span>Quick Start Guide</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          
          {activeTab === 'faq' && (
            <div className="space-y-2.5">
              {FAQS.map((faq, index) => {
                const isExpanded = expandedFaqIndex === index
                return (
                  <div 
                    key={index} 
                    className="border border-border-color rounded-xl overflow-hidden bg-bg-primary/20 transition-all duration-200"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold hover:bg-bg-primary/40 text-text-primary transition-colors gap-3"
                    >
                      <span>{faq.question}</span>
                      {isExpanded ? (
                        <ChevronUp size={14} className="text-accent flex-shrink-0" />
                      ) : (
                        <ChevronDown size={14} className="text-text-muted flex-shrink-0" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="p-3.5 border-t border-border-color text-xs text-text-secondary leading-relaxed font-semibold bg-bg-primary/10">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="space-y-4 text-xs font-semibold text-text-secondary leading-relaxed">
              
              <div className="flex gap-3 bg-accent/5 border border-accent/15 rounded-xl p-3.5 items-start">
                <Compass className="text-accent flex-shrink-0 mt-0.5" size={16} />
                <div className="space-y-1">
                  <h4 className="font-bold text-text-primary">Interactive Recommendation Map</h4>
                  <p>Check the map view pane to visually browse nearby food locations matching your criteria. Restaurants with high scores are colored prominently.</p>
                </div>
              </div>

              <div className="flex gap-3 bg-accent/5 border border-accent/15 rounded-xl p-3.5 items-start">
                <HelpCircle className="text-accent flex-shrink-0 mt-0.5" size={16} />
                <div className="space-y-1">
                  <h4 className="font-bold text-text-primary">Chatbot Food Identifiers</h4>
                  <p>In recommendations, click on restaurant link names to quickly pop open their menus. Tap the heart symbol next to food items to instantly save them to your custom favorites list.</p>
                </div>
              </div>

              <div className="flex gap-3 bg-accent/5 border border-accent/15 rounded-xl p-3.5 items-start">
                <Lightbulb className="text-accent flex-shrink-0 mt-0.5" size={16} />
                <div className="space-y-1">
                  <h4 className="font-bold text-text-primary">Dietary & Cost Filters</h4>
                  <p>Looking for Veg only or Gluten-free meals? Adjust price settings and toggle vegetarian options under advanced filters to narrow down your options instantly.</p>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  )
}
