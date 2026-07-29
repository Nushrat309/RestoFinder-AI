import React, { useEffect, useRef, useState } from 'react'
import { MapPin, Star, Search, SlidersHorizontal, Heart, Clock } from 'lucide-react'

const CITY_AREAS = {
  all: [],
  Dhaka: ['Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Mirpur', 'Mohammadpur', 'Bashundhara R/A', 'Old Dhaka', 'Khilgaon', 'Wari'],
  Chattogram: ['GEC Circle', 'Agrabad', 'Halishahar', 'Nasirabad', 'Khulshi', 'Panchlaish'],
  Sylhet: ['Zindabazar', 'Amberkhana', 'Shibganj', 'Upashahar'],
  Rajshahi: ['Saheb Bazar', 'Kazla', 'Motihar', 'Boalia'],
  Khulna: ['Boyra', 'Khalishpur', 'Sonadanga', 'Shibatola'],
  Barishal: ['Sadar Road', 'Nathullabad', 'C&B Road', 'Band Road'],
  Rangpur: ['Jahaz Company Mor', 'Dhap', 'Modern Mor', 'Medical Mor'],
  Mymensingh: ['Ganginarpar', 'Town Hall', 'Charpara', 'Patgola'],
  "Cox's Bazar": ['Kolatoli', 'Sugandha Beach', 'Laboni Beach', 'Inani'],
  Cumilla: ['Kandirpar', 'Badurtala', 'Jhautala', 'Kotbari'],
  Bogura: ['Saatmatha', 'Jamilnagar', 'Chelopara', 'Thanthania'],
  Narayanganj: ['Chashara', 'Shitalakshya', 'Nitayganj', 'Signboard'],
  Gazipur: ['Board Bazar', 'Chowrasta', 'Tongi', 'Konabari'],
  Jessore: ['Palbari', 'Doratana', 'Jessore Sadar', 'KhayerTala']
}

// Category selection pills
const categories = [
  { id: 'all', label: '🍕 All Foods' },
  { id: 'kacchi', label: '🍛 Kacchi' },
  { id: 'burger', label: '🍔 Burgers' },
  { id: 'pizza', label: '🍕 Pizza' },
  { id: 'tehari', label: '🍚 Tehari' },
  { id: 'chinese', label: '🥢 Chinese' },
  { id: 'bbq', label: '🥩 BBQ & Grills' },
  { id: 'steak', label: '🥩 Steaks' },
  { id: 'coffee', label: '☕ Coffee' },
  { id: 'desserts', label: '🍰 Desserts' },
  { id: 'snacks', label: '🍟 Snacks' }
]

// React Wrapper for Leaflet Map
function MapView({ filteredRestaurants, onExploreMenu, theme }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    const isLightTheme = theme === 'light'
    
    if (!mapRef.current && mapContainerRef.current) {
      const map = L.map(mapContainerRef.current).setView([23.7803, 90.4125], 12)
      mapRef.current = map

      const tilesUrl = isLightTheme
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

      L.tileLayer(tilesUrl, {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
      }).addTo(map)
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Sync theme tiles
  useEffect(() => {
    if (!mapRef.current) return
    const isLightTheme = theme === 'light'
    
    // Remove existing tile layer
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapRef.current.removeLayer(layer)
      }
    })

    const tilesUrl = isLightTheme
      ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

    L.tileLayer(tilesUrl, {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(mapRef.current)
  }, [filteredRestaurants, theme]) // Re-run tile verification on filter changes or theme changes

  // Update Markers
  useEffect(() => {
    if (!mapRef.current) return

    // Clear old markers
    markersRef.current.forEach(m => mapRef.current.removeLayer(m))
    markersRef.current = []

    if (filteredRestaurants.length === 0) return

    const bounds = []

    filteredRestaurants.forEach(rest => {
      if (rest.lat && rest.lng) {
        const lat = parseFloat(rest.lat)
        const lng = parseFloat(rest.lng)
        bounds.push([lat, lng])

        const marker = L.marker([lat, lng]).addTo(mapRef.current)

        marker.bindPopup(`
          <div class="map-popup-card">
            <h3 class="map-popup-title">${rest.name}</h3>
            <p class="map-popup-cuisine">${rest.cuisine}</p>
            <div class="map-popup-badge">⭐ ${rest.rating}</div>
            <button class="map-popup-btn" id="map-btn-${rest.id}">Explore Menu</button>
          </div>
        `)

        marker.on('popupopen', () => {
          const btn = document.getElementById(`map-btn-${rest.id}`)
          if (btn) {
            btn.onclick = () => onExploreMenu(rest.id)
          }
        })

        markersRef.current.push(marker)
      }
    })

    if (bounds.length > 0) {
      mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
    }
  }, [filteredRestaurants])

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full min-h-[380px] md:min-h-[480px] rounded-2xl overflow-hidden border border-border-color shadow-sm z-10" 
    />
  )
}

export default function ExplorerPane({
  theme,
  activeTab,
  setActiveTab,
  restaurants,
  filteredRestaurants,
  isLoading,
  loadError,
  favorites,
  isFavoriteRestaurant,
  toggleFavoriteRestaurant,
  isFavoriteItem,
  toggleFavoriteItem,
  onExploreMenu,
  query, setQuery,
  city, setCity,
  location, setLocation,
  cuisine, setCuisine,
  maxPrice, setMaxPrice,
  vegOnly, setVegOnly,
  glutenFree, setGlutenFree,
  inStock, setInStock,
  activeCategory, setActiveCategory
}) {
  const [showFilters, setShowFilters] = useState(false)

  // Handle city change (resets location)
  const handleCityChange = (e) => {
    const val = e.target.value
    setCity(val)
    setLocation('all')
  }

  // Get list of matching food menu items
  const getMatchingFoodItems = () => {
    const items = []
    const q = query.trim().toLowerCase()
    
    restaurants.forEach(rest => {
      // City check
      if (city !== 'all' && rest.city && rest.city.toLowerCase() !== city.toLowerCase()) return
      // Location check
      if (location !== 'all' && (rest.location || rest.area) !== location) return
      // Cuisine check
      if (cuisine !== 'all' && !rest.cuisine.toLowerCase().includes(cuisine.toLowerCase())) return

      rest.menu.forEach(item => {
        const matchesCat = activeCategory === 'all' || 
          item.category.toLowerCase().includes(activeCategory.toLowerCase())
        const matchesPrice = item.price <= maxPrice
        const matchesVeg = !vegOnly || item.dietary_tags.includes('Veg')
        const matchesGf = !glutenFree || item.dietary_tags.includes('Gluten-Free')
        const matchesStock = !inStock || item.available

        let matchesSearch = true
        if (q) {
          matchesSearch = item.name.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            rest.name.toLowerCase().includes(q) ||
            (rest.location || '').toLowerCase().includes(q)
        }

        if (matchesCat && matchesPrice && matchesVeg && matchesGf && matchesStock && matchesSearch) {
          items.push({ item, rest })
        }
      })
    })

    return items
  }

  const matchingFoodItems = getMatchingFoodItems()

  // Get favorite items list
  const getFavoriteRestaurantsList = () => {
    return restaurants.filter(rest => isFavoriteRestaurant(rest.id))
  }

  const getFavoriteFoodItemsList = () => {
    const list = []
    restaurants.forEach(rest => {
      rest.menu.forEach(item => {
        if (isFavoriteItem(item.id)) {
          list.push({ item, rest })
        }
      })
    })
    return list
  }

  const favRestaurants = getFavoriteRestaurantsList()
  const favFoodItems = getFavoriteFoodItemsList()

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden space-y-4 animate-fade-in">
      
      {/* Search & Tabs Top Bar */}
      <div className="flex flex-col gap-3">
        
        {/* Search input bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search restaurant names, dishes, cuisines..."
              className="w-full bg-bg-secondary border border-border-color focus:border-accent/60 outline-none pl-10 pr-4 py-2.5 rounded-xl text-sm transition-colors text-text-primary placeholder-text-muted"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl border flex items-center gap-2 text-sm font-semibold transition-all duration-200
              ${showFilters 
                ? 'bg-accent/10 border-accent text-accent' 
                : 'bg-bg-secondary border-border-color text-text-secondary hover:text-text-primary hover:border-text-secondary'
              }
            `}
          >
            <SlidersHorizontal size={15} />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {/* Expandable Advanced Filters Box */}
        {showFilters && (
          <div className="p-4 bg-bg-secondary border border-border-color rounded-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-slide-up">
            
            {/* City Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">City</label>
              <select 
                value={city}
                onChange={handleCityChange}
                className="bg-bg-primary border border-border-color rounded-xl p-2.5 text-xs text-text-primary outline-none focus:border-accent"
              >
                <option value="all">All Cities</option>
                <option value="Dhaka">Dhaka</option>
                <option value="Chattogram">Chattogram</option>
                <option value="Sylhet">Sylhet</option>
                <option value="Rajshahi">Rajshahi</option>
                <option value="Khulna">Khulna</option>
                <option value="Barishal">Barishal</option>
                <option value="Rangpur">Rangpur</option>
                <option value="Mymensingh">Mymensingh</option>
                <option value="Cox's Bazar">Cox's Bazar</option>
                <option value="Cumilla">Cumilla</option>
                <option value="Bogura">Bogura</option>
                <option value="Narayanganj">Narayanganj</option>
                <option value="Gazipur">Gazipur</option>
                <option value="Jessore">Jessore</option>
              </select>
            </div>

            {/* Area Zone Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Area / Zone</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={city === 'all'}
                className="bg-bg-primary border border-border-color rounded-xl p-2.5 text-xs text-text-primary outline-none focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="all">All Zones</option>
                {city !== 'all' && CITY_AREAS[city]?.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

            {/* Cuisine Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Cuisine Type</label>
              <select
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                className="bg-bg-primary border border-border-color rounded-xl p-2.5 text-xs text-text-primary outline-none focus:border-accent"
              >
                <option value="all">All Cuisines</option>
                <option value="biryani">Biryani & Kacchi</option>
                <option value="burger">Burgers</option>
                <option value="pizza">Pizza</option>
                <option value="bengali">Bengali</option>
                <option value="chinese">Chinese & Asian</option>
                <option value="cafe">Cafe & Coffee</option>
                <option value="bakery">Bakery & Desserts</option>
                <option value="steak">Steak & BBQ</option>
              </select>
            </div>

            {/* Price Budget Limit Slider */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Max Food Price</label>
                <span className="text-xs font-bold text-accent">৳ {maxPrice}</span>
              </div>
              <input
                type="range"
                min="50"
                max="2500"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="accent-accent w-full"
              />
            </div>

            {/* Checkbox Options */}
            <div className="flex items-center gap-4 pt-4 sm:col-span-2 md:col-span-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-text-secondary hover:text-text-primary select-none">
                <input
                  type="checkbox"
                  checked={vegOnly}
                  onChange={(e) => setVegOnly(e.target.checked)}
                  className="rounded accent-accent w-4 h-4"
                />
                <span>🥦 Veg Only</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-text-secondary hover:text-text-primary select-none">
                <input
                  type="checkbox"
                  checked={glutenFree}
                  onChange={(e) => setGlutenFree(e.target.checked)}
                  className="rounded accent-accent w-4 h-4"
                />
                <span>🌾 Gluten-Free</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-text-secondary hover:text-text-primary select-none">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="rounded accent-accent w-4 h-4"
                />
                <span>🟢 In Stock Only</span>
              </label>
            </div>

          </div>
        )}

        {/* Category Selector Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none whitespace-nowrap">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200
                ${activeCategory === cat.id
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-bg-secondary border border-border-color text-text-secondary hover:text-text-primary hover:border-text-secondary'
                }
              `}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Explorer Pane Tabs */}
      <div className="flex border-b border-border-color">
        {['map', 'restaurants', 'food', 'favorites'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-xs md:text-sm font-bold border-b-2 capitalize transition-all duration-200
              ${activeTab === tab
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary hover:text-text-primary'
              }
            `}
          >
            {tab === 'map' ? '🗺️ Map View' : 
             tab === 'restaurants' ? '🏢 Restaurants' : 
             tab === 'food' ? '🍔 Food Items' : '❤️ Favorites'}
          </button>
        ))}
      </div>

      {/* Main Tab Contents Panel */}
      <div className="flex-1 min-h-0 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 text-text-secondary">
            <span className="w-8 h-8 rounded-full border-4 border-accent border-t-transparent animate-spin"></span>
            <span className="text-xs font-semibold">Loading explorer data...</span>
          </div>
        ) : loadError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-red-400 p-4">
            <p className="font-semibold mb-1">Failed to fetch restaurants database.</p>
            <p className="text-xs opacity-75">Verify the FastAPI server is running locally on port 8000.</p>
          </div>
        ) : (
          <div className="w-full h-full overflow-y-auto pr-1">
            
            {/* 1. Map View Tab */}
            {activeTab === 'map' && (
              <div className="w-full h-full">
                <MapView 
                  filteredRestaurants={filteredRestaurants} 
                  onExploreMenu={onExploreMenu} 
                  theme={theme}
                />
              </div>
            )}

            {/* 2. Restaurants Tab */}
            {activeTab === 'restaurants' && (
              filteredRestaurants.length === 0 ? (
                <div className="text-center py-12 text-text-secondary font-medium">
                  🏢 No restaurants match your filter configurations.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredRestaurants.map(rest => {
                    const isFav = isFavoriteRestaurant(rest.id)
                    let mainImg = 'images/default_food.png'
                    const hasImageItem = rest.menu.find(i => i.image_url && !i.image_url.includes('default'))
                    if (hasImageItem) mainImg = hasImageItem.image_url

                    return (
                      <div 
                        key={rest.id}
                        className="bg-bg-secondary border border-border-color rounded-2xl overflow-hidden shadow-sm hover:shadow-glow group hover:border-accent/40 transition-all duration-300 flex flex-col h-full"
                      >
                        <div className="h-40 overflow-hidden relative bg-bg-primary/20">
                          {/* Favorite button absolute */}
                          <button
                            onClick={() => toggleFavoriteRestaurant(rest.id)}
                            className={`absolute top-3 right-3 z-10 p-2.5 rounded-xl border shadow-sm backdrop-blur-md transition-all duration-200
                              ${isFav 
                                ? 'bg-red-500/10 border-red-500/40 text-red-500' 
                                : 'bg-black/30 border-white/10 text-white hover:bg-black/50'
                              }
                            `}
                            title="Favorite restaurant"
                          >
                            <Heart size={14} fill={isFav ? 'currentColor' : 'none'} />
                          </button>
                          
                          <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md border border-white/10 text-[#fbbf24] text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                            <Star size={11} fill="currentColor" />
                            <span>{rest.rating}</span>
                          </span>

                          <img
                            src={mainImg}
                            alt={rest.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => { e.target.src = 'images/default_food.png' }}
                          />
                        </div>

                        <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                          <div>
                            <h3 className="text-base font-extrabold truncate text-text-primary">
                              {rest.name}
                            </h3>
                            <p className="text-xs text-text-secondary truncate mt-0.5">
                              {rest.cuisine}
                            </p>
                            <p className="text-[11px] text-text-muted mt-2 flex items-center gap-1">
                              <MapPin size={11} className="text-accent" />
                              <span className="truncate">{rest.location || rest.area}, {rest.city}</span>
                            </p>

                            <div className="flex gap-1.5 mt-3 flex-wrap">
                              {rest.delivery_available && (
                                <span className="text-[9px] font-bold px-2 py-1 rounded bg-green-500/10 border border-green-500/20 text-green-500">
                                  🛵 Delivery
                                </span>
                              )}
                              {rest.dine_in_available && (
                                <span className="text-[9px] font-bold px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-500">
                                  🍽️ Dine-in
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-border-color pt-3 mt-1">
                            <span className="text-xs font-extrabold text-text-secondary">
                              {rest.price_range}
                            </span>
                            <button
                              onClick={() => onExploreMenu(rest.id)}
                              className="text-xs font-bold py-1.5 px-3 rounded-lg bg-accent text-white hover:opacity-95 shadow-sm transition-all"
                            >
                              Explore Menu
                            </button>
                          </div>
                        </div>

                      </div>
                    )
                  })}
                </div>
              )
            )}

            {/* 3. Food Search Items Tab */}
            {activeTab === 'food' && (
              matchingFoodItems.length === 0 ? (
                <div className="text-center py-12 text-text-secondary font-medium">
                  🍔 No food items match search query.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {matchingFoodItems.map(({ item, rest }) => {
                    const isFav = isFavoriteItem(item.id)

                    return (
                      <div 
                        key={item.id}
                        className="bg-bg-secondary border border-border-color rounded-2xl p-3 shadow-sm hover:border-accent/40 transition-colors flex gap-3 h-full"
                      >
                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-bg-primary/20 flex-shrink-0 relative">
                          <span className={`absolute top-1.5 left-1.5 text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm border
                            ${item.available 
                              ? 'bg-green-500/15 border-green-500/30 text-green-500' 
                              : 'bg-red-500/15 border-red-500/30 text-red-500'
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

                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start gap-1">
                              <h4 className="text-sm font-extrabold truncate text-text-primary">
                                {item.name}
                              </h4>
                              <button
                                onClick={() => toggleFavoriteItem(item.id)}
                                className={`text-sm flex-shrink-0 transition-transform active:scale-95`}
                                title="Favorite menu item"
                              >
                                {isFav ? '💖' : '🖤'}
                              </button>
                            </div>
                            
                            <div className="flex gap-1.5 mt-1.5 flex-wrap">
                              {item.dietary_tags?.map(t => (
                                <span 
                                  key={t}
                                  className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border
                                    ${t === 'Veg' 
                                      ? 'bg-green-500/10 border-green-500/25 text-green-500' 
                                      : 'bg-yellow-500/10 border-yellow-500/25 text-yellow-500'
                                    }
                                  `}
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                            <p className="text-[11px] text-text-secondary line-clamp-2 mt-1.5 leading-relaxed">
                              {item.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between border-t border-border-color pt-2 mt-2">
                            <button
                              onClick={() => onExploreMenu(rest.id)}
                              className="text-[10px] font-bold text-accent hover:text-accent-hover truncate"
                            >
                              Served at: {rest.name}
                            </button>
                            <span className="text-xs font-extrabold text-text-primary ml-2 flex-shrink-0">
                              ৳ {item.price}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            )}

            {/* 4. Favorites Tab */}
            {activeTab === 'favorites' && (
              <div className="space-y-6">
                
                {/* Saved Restaurants section */}
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-extrabold text-text-muted mb-3 flex items-center gap-1.5">
                    <span>🏢 Saved Restaurants</span>
                    <span className="bg-bg-secondary px-2 py-0.5 rounded-full text-[10px] font-extrabold text-text-secondary border border-border-color">
                      {favRestaurants.length}
                    </span>
                  </h3>
                  
                  {favRestaurants.length === 0 ? (
                    <div className="text-xs text-text-muted italic bg-bg-secondary/40 border border-dashed border-border-color p-4 rounded-xl text-center">
                      No saved restaurants yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {favRestaurants.map(rest => (
                        <div 
                          key={rest.id}
                          className="bg-bg-secondary border border-border-color rounded-2xl p-3 shadow-sm flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <h4 className="text-sm font-extrabold truncate text-text-primary">{rest.name}</h4>
                            <p className="text-[11px] text-text-secondary truncate mt-0.5">{rest.cuisine}</p>
                            <p className="text-[10px] text-text-muted truncate mt-1">📍 {rest.location || rest.area}</p>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => toggleFavoriteRestaurant(rest.id)}
                              className="p-2 hover:bg-bg-primary rounded-lg text-red-500 border border-transparent hover:border-border-color transition-all"
                            >
                              <Heart size={14} fill="currentColor" />
                            </button>
                            <button
                              onClick={() => onExploreMenu(rest.id)}
                              className="text-xs font-bold py-1.5 px-3 rounded-lg bg-accent text-white hover:opacity-95 transition-all"
                            >
                              Menu
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Saved Food Items section */}
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-extrabold text-text-muted mb-3 flex items-center gap-1.5">
                    <span>🍔 Saved Dishes</span>
                    <span className="bg-bg-secondary px-2 py-0.5 rounded-full text-[10px] font-extrabold text-text-secondary border border-border-color">
                      {favFoodItems.length}
                    </span>
                  </h3>
                  
                  {favFoodItems.length === 0 ? (
                    <div className="text-xs text-text-muted italic bg-bg-secondary/40 border border-dashed border-border-color p-4 rounded-xl text-center">
                      No saved dishes yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {favFoodItems.map(({ item, rest }) => (
                        <div 
                          key={item.id}
                          className="bg-bg-secondary border border-border-color rounded-2xl p-3 shadow-sm flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <h4 className="text-sm font-extrabold truncate text-text-primary">{item.name}</h4>
                            <button
                              onClick={() => onExploreMenu(rest.id)}
                              className="text-[10px] text-accent font-bold hover:underline truncate block mt-0.5 text-left"
                            >
                              Served by: {rest.name}
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="text-xs font-extrabold text-text-primary">
                              ৳ {item.price}
                            </span>
                            <button
                              onClick={() => toggleFavoriteItem(item.id)}
                              className="p-1 text-red-500 hover:bg-bg-primary rounded-lg transition-colors"
                            >
                              💖
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        )}
      </div>

    </div>
  )
}
