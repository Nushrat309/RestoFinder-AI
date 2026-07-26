import React, { useState } from 'react'
import { X, Heart, MapPin, Phone, Clock, Search } from 'lucide-react'

export default function MenuModal({
  restaurantId,
  restaurants,
  isFavoriteRestaurant,
  toggleFavoriteRestaurant,
  isFavoriteItem,
  toggleFavoriteItem,
  onClose
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const rest = restaurants.find(r => r.id === restaurantId)

  if (!rest) return null

  const isFav = isFavoriteRestaurant(rest.id)

  // Filter food menu items based on input value
  const filteredMenu = rest.menu.filter(item => {
    if (!searchTerm.trim()) return true
    const s = searchTerm.toLowerCase()
    return item.name.toLowerCase().includes(s) ||
      item.category.toLowerCase().includes(s) ||
      item.description.toLowerCase().includes(s)
  })

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Modal Pane */}
      <div className="bg-bg-secondary border border-border-color w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl relative z-10 max-h-[90vh] flex flex-col animate-slide-up">
        
        {/* Header Navigation */}
        <div className="p-4 md:p-6 border-b border-border-color flex justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-text-primary">
                {rest.name}
              </h2>
              <button
                onClick={() => toggleFavoriteRestaurant(rest.id)}
                className={`p-2.5 rounded-xl border shadow-sm transition-all duration-200
                  ${isFav 
                    ? 'bg-red-500/10 border-red-500/30 text-red-500' 
                    : 'bg-bg-primary border-border-color text-text-secondary hover:text-text-primary'
                  }
                `}
                title="Save Restaurant"
              >
                <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
              </button>
            </div>
            
            <p className="text-xs md:text-sm text-text-secondary mt-1">
              {rest.cuisine} • ⭐ {rest.rating} ({rest.review_count || 12} reviews) • {rest.price_range}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-bg-primary hover:bg-bg-primary/80 border border-border-color hover:border-text-secondary text-text-secondary hover:text-text-primary rounded-xl transition-all"
            title="Close details"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          
          {/* Restaurant Metadata Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Location Address */}
            <div className="bg-bg-primary/45 border border-border-color p-3.5 rounded-xl flex items-start gap-3">
              <MapPin size={18} className="text-accent mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Address</h4>
                <p className="text-sm font-semibold text-text-primary leading-tight">{rest.location || rest.area}</p>
                {rest.google_maps_url && (
                  <a
                    href={rest.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-accent font-bold hover:underline inline-block mt-1.5"
                  >
                    🗺️ View on Google Maps
                  </a>
                )}
              </div>
            </div>

            {/* Opening Hours */}
            <div className="bg-bg-primary/45 border border-border-color p-3.5 rounded-xl flex items-start gap-3">
              <Clock size={18} className="text-accent mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Opening Hours</h4>
                <p className="text-sm font-semibold text-text-primary">{rest.opening_hours || '10:00 AM - 11:00 PM'}</p>
                <span className="text-[10px] bg-green-500/10 text-green-500 border border-green-500/20 font-bold px-2 py-0.5 rounded-full inline-block mt-2">
                  Open Now
                </span>
              </div>
            </div>

            {/* Contact Phone */}
            <div className="bg-bg-primary/45 border border-border-color p-3.5 rounded-xl flex items-start gap-3">
              <Phone size={18} className="text-accent mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Contact</h4>
                <p className="text-sm font-semibold text-text-primary">{rest.contact || '+880 1700-000000'}</p>
              </div>
            </div>

          </div>

          {/* Customer Reviews section */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-extrabold text-text-muted mb-3">
              📢 Customer Reviews ({rest.reviews?.length || 0})
            </h3>
            
            {(!rest.reviews || rest.reviews.length === 0) ? (
              <p className="text-xs text-text-muted italic">No customer reviews available yet.</p>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                {rest.reviews.map((rev, idx) => (
                  <div 
                    key={idx}
                    className="min-w-[280px] max-w-[320px] bg-bg-primary/30 border border-border-color p-4 rounded-xl flex-shrink-0 flex flex-col justify-between"
                  >
                    <p className="text-xs italic text-text-secondary leading-relaxed mb-3">
                      "{rev.text}"
                    </p>
                    <div className="flex justify-between items-center border-t border-border-color pt-2 text-xs">
                      <span className="font-extrabold text-text-primary">{rev.user}</span>
                      <span className="text-[#fbbf24] font-bold">⭐ {rev.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Search Menu section */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border-color pb-3 mb-4">
              <h3 className="text-sm uppercase tracking-wider font-extrabold text-text-primary">
                📖 Food Menu Items
              </h3>
              
              <div className="relative max-w-xs w-full">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search dishes in menu..."
                  className="w-full bg-bg-primary border border-border-color focus:border-accent outline-none pl-9 pr-3 py-1.5 rounded-xl text-xs text-text-primary"
                />
              </div>
            </div>

            {/* Menu Items Grid */}
            {filteredMenu.length === 0 ? (
              <div className="text-center py-8 text-text-secondary text-xs">
                🍕 No food dishes match menu search query.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredMenu.map(item => {
                  const itemFav = isFavoriteItem(item.id)
                  
                  return (
                    <div 
                      key={item.id}
                      className="bg-bg-primary/20 border border-border-color hover:border-accent/30 rounded-xl overflow-hidden shadow-sm flex flex-col"
                    >
                      {/* Item Image */}
                      <div className="h-28 overflow-hidden relative bg-bg-primary/30">
                        {item.popularity_badge && item.popularity_badge !== 'Regular' && (
                          <span className={`absolute top-2 left-2 z-10 text-[8px] font-extrabold px-1.5 py-0.5 rounded shadow-sm
                            ${item.popularity_badge === 'Best Seller' 
                              ? 'bg-amber-500 text-white' 
                              : 'bg-blue-500 text-white'
                            }
                          `}>
                            {item.popularity_badge}
                          </span>
                        )}
                        <span className={`absolute bottom-2 left-2 z-10 text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm border
                          ${item.available 
                            ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                            : 'bg-red-500/25 border-red-500/30 text-red-400'
                          }
                        `}>
                          {item.available ? 'In Stock' : 'Out of Stock'}
                        </span>
                        
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = 'images/default_food.png' }}
                        />
                      </div>

                      {/* Item Details */}
                      <div className="p-3 flex-1 flex flex-col justify-between gap-2.5">
                        <div>
                          <div className="flex justify-between items-start gap-1">
                            <h4 className="text-xs font-extrabold text-text-primary line-clamp-1">
                              {item.name}
                            </h4>
                            <button
                              onClick={() => toggleFavoriteItem(item.id)}
                              className="text-xs select-none transition-transform active:scale-90"
                              title="Favorite item"
                            >
                              {itemFav ? '💖' : '🖤'}
                            </button>
                          </div>
                          
                          <div className="flex gap-1 mt-1">
                            {item.dietary_tags?.map(t => (
                              <span 
                                key={t}
                                className={`text-[8px] font-bold px-1 py-0.5 rounded border
                                  ${t === 'Veg' 
                                    ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                                    : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                                  }
                                `}
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                          <p className="text-[10px] text-text-secondary line-clamp-2 mt-2 leading-normal">
                            {item.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between border-t border-border-color/60 pt-2 mt-1">
                          <span className="text-xs font-bold text-text-primary">
                            ৳ {item.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  )
}
