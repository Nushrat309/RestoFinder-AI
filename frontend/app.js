document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatContainer = document.getElementById('chat-container');
    const sendButton = document.getElementById('send-button');

    // API endpoints
    const BASE_URL = 'http://localhost:8000';
    const API_URL = `${BASE_URL}/chat`;
    const RESTAURANTS_API = `${BASE_URL}/api/restaurants`;

    // Global state
    let allRestaurants = [];
    let activeCategory = 'all';
    let activeViewTab = 'map'; // 'map', 'restaurants', 'food', 'favorites'

    // Map instances
    let mapInstance = null;
    let mapMarkers = [];

    // Elements
    const mapContainer = document.getElementById('dhaka-map');
    const restaurantGrid = document.getElementById('restaurant-grid');
    const foodSearchContainer = document.getElementById('food-search-container');
    const foodSearchGrid = document.getElementById('food-search-grid');
    const favoritesContainer = document.getElementById('favorites-container');
    const favRestaurantsGrid = document.getElementById('fav-restaurants-grid');
    const favItemsGrid = document.getElementById('fav-items-grid');
    const favCountSpan = document.getElementById('fav-count');

    const searchInput = document.getElementById('search-input');
    const cityFilter = document.getElementById('city-filter');
    const locationFilter = document.getElementById('location-filter');
    const cuisineFilter = document.getElementById('cuisine-filter');
    const priceRange = document.getElementById('price-range');
    const priceVal = document.getElementById('price-val');
    const vegFilter = document.getElementById('veg-filter');
    const glutenFilter = document.getElementById('gluten-filter');
    const availableFilter = document.getElementById('available-filter');
    const filterToggleBtn = document.getElementById('filter-toggle-btn');
    const filtersDrawer = document.getElementById('filters-drawer');
    const categoryPills = document.getElementById('category-pills');
    const areaChipsContainer = document.getElementById('area-chips-container');

    // View Navigation Tabs
    const mapViewTab = document.getElementById('map-view-tab');
    const exploreRestaurantsTab = document.getElementById('explore-restaurants-tab');
    const foodSearchTab = document.getElementById('food-search-tab');
    const favoritesTab = document.getElementById('favorites-tab');

    // Mobile tabs
    const tabChatBtn = document.getElementById('tab-chat-btn');
    const tabExploreBtn = document.getElementById('tab-explore-btn');
    const chatPane = document.getElementById('chat-pane');
    const explorerPane = document.getElementById('explorer-pane');

    // Menu Modal Elements
    const menuModal = document.getElementById('menu-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalRestaurantName = document.getElementById('modal-restaurant-name');
    const modalCuisine = document.getElementById('modal-cuisine');
    const modalLocation = document.getElementById('modal-location');
    const modalRating = document.getElementById('modal-rating');
    const modalReviewsCount = document.getElementById('modal-reviews-count');
    const modalPriceRange = document.getElementById('modal-price-range');
    const modalHours = document.getElementById('modal-hours');
    const modalContact = document.getElementById('modal-contact');
    const modalFavBtn = document.getElementById('modal-fav-btn');
    const modalMapsLink = document.getElementById('modal-maps-link');
    const modalReviewsList = document.getElementById('modal-reviews-list');
    const modalMenuSearch = document.getElementById('modal-menu-search');
    const modalMenuItemsGrid = document.getElementById('modal-menu-items');

    let currentSelectedRestaurant = null;

    // --- Favorites Helper Functions (localStorage) ---
    function getFavorites() {
        const favs = localStorage.getItem('restofinder_favs');
        return favs ? JSON.parse(favs) : { restaurants: [], items: [] };
    }

    function saveFavorites(favs) {
        localStorage.setItem('restofinder_favs', JSON.stringify(favs));
        updateFavoritesUI();
    }

    function toggleFavoriteRestaurant(id) {
        const favs = getFavorites();
        const index = favs.restaurants.indexOf(id);
        if (index === -1) {
            favs.restaurants.push(id);
        } else {
            favs.restaurants.splice(index, 1);
        }
        saveFavorites(favs);
        applyFilters(); // Re-render to update the heart icon states
        
        if (currentSelectedRestaurant && currentSelectedRestaurant.id === id) {
            const isFav = favs.restaurants.includes(id);
            modalFavBtn.classList.toggle('is-fav', isFav);
        }
    }

    function toggleFavoriteItem(itemId) {
        const favs = getFavorites();
        const index = favs.items.indexOf(itemId);
        if (index === -1) {
            favs.items.push(itemId);
        } else {
            favs.items.splice(index, 1);
        }
        saveFavorites(favs);
        
        if (currentSelectedRestaurant) {
            renderModalMenuItems(currentSelectedRestaurant.menu);
        }
        updateFavoritesUI();
        if (activeViewTab === 'food') {
            applyFilters();
        }
    }

    function isFavoriteRestaurant(id) {
        return getFavorites().restaurants.includes(id);
    }

    function isFavoriteItem(id) {
        return getFavorites().items.includes(id);
    }

    // Expose toggle functions globally
    window.toggleFavoriteRestaurant = toggleFavoriteRestaurant;
    window.toggleFavoriteItem = toggleFavoriteItem;

    // --- Leaflet Interactive Map Logic ---
    function initMap() {
        if (!mapContainer || typeof L === 'undefined') return;
        if (mapInstance) return;

        // Initialize Leaflet map centered at Dhaka
        mapInstance = L.map('dhaka-map', {
            center: [23.7803, 90.4125],
            zoom: 12,
            zoomControl: true
        });

        // CartoDB Dark Matter tiles
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(mapInstance);
    }

    function updateMapMarkers(restaurants) {
        if (!mapInstance) initMap();
        if (!mapInstance) return;

        // Clear existing markers
        mapMarkers.forEach(m => mapInstance.removeLayer(m));
        mapMarkers = [];

        if (!restaurants || restaurants.length === 0) return;

        const bounds = [];
        restaurants.forEach(rest => {
            const lat = rest.coordinates?.lat || 23.7803;
            const lng = rest.coordinates?.lng || 90.4125;
            bounds.push([lat, lng]);

            const popupContent = `
                <div class="map-popup-card">
                    <div class="map-popup-title">${rest.name}</div>
                    <div class="map-popup-cuisine">📍 ${rest.location} &bull; ${rest.cuisine}</div>
                    <div class="map-popup-badge">⭐ ${rest.rating} (${rest.review_count} reviews) &bull; ${rest.price_range}</div>
                    <button class="map-popup-btn" onclick="openMenuModal('${rest.id}')">📂 Explore Menu</button>
                </div>
            `;

            const marker = L.marker([lat, lng])
                .addTo(mapInstance)
                .bindPopup(popupContent);
            
            mapMarkers.push(marker);
        });

        // Auto zoom/fit bounds smoothly
        if (bounds.length > 0) {
            if (bounds.length === 1) {
                mapInstance.setView(bounds[0], 14, { animate: true });
            } else {
                mapInstance.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
            }
        }
    }

    // --- Fetch Data ---
    async function loadRestaurants() {
        try {
            const res = await fetch(RESTAURANTS_API);
            if (!res.ok) throw new Error('Failed to fetch restaurants');
            allRestaurants = await res.json();
            initMap();
            applyFilters();
            updateFavoritesUI();
        } catch (err) {
            console.error('Error loading restaurants:', err);
            if (restaurantGrid) {
                restaurantGrid.innerHTML = `
                    <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">
                        <p>⚠️ Failed to load restaurant database. Make sure the backend FastAPI server is running.</p>
                    </div>
                `;
            }
        }
    }

    // --- Filtering Logic ---
    function applyFilters() {
        const query = searchInput.value.trim().toLowerCase();
        const selectedCity = cityFilter ? cityFilter.value : 'all';
        const location = locationFilter ? locationFilter.value : 'all';
        const selectedCuisine = cuisineFilter ? cuisineFilter.value : 'all';
        const maxBudget = parseInt(priceRange.value, 10);
        const vegOnly = vegFilter.checked;
        const gfOnly = glutenFilter.checked;
        const inStockOnly = availableFilter.checked;

        const filtered = allRestaurants.filter(rest => {
            // 0. City Filter
            if (selectedCity !== 'all' && rest.city && rest.city.toLowerCase() !== selectedCity.toLowerCase()) {
                return false;
            }

            // 1. Location Filter
            if (location !== 'all' && (rest.location || rest.area) !== location) return false;

            // 2. Cuisine Filter
            if (selectedCuisine !== 'all') {
                if (!rest.cuisine.toLowerCase().includes(selectedCuisine.toLowerCase())) return false;
            }

            // 3. Item-based tags and budget filters
            const matchesCategoryAndTags = rest.menu.some(item => {
                const matchesCat = activeCategory === 'all' || 
                    item.category.toLowerCase().includes(activeCategory.toLowerCase());
                const matchesPrice = item.price <= maxBudget;
                const matchesVeg = !vegOnly || item.dietary_tags.includes('Veg');
                const matchesGf = !gfOnly || item.dietary_tags.includes('Gluten-Free');
                const matchesStock = !inStockOnly || item.available;

                return matchesCat && matchesPrice && matchesVeg && matchesGf && matchesStock;
            });

            if (!matchesCategoryAndTags) return false;

            // 4. Search query filter
            if (query) {
                const matchesRestInfo = rest.name.toLowerCase().includes(query) ||
                                       rest.cuisine.toLowerCase().includes(query) ||
                                       (rest.location || rest.area || '').toLowerCase().includes(query) ||
                                       (rest.city || '').toLowerCase().includes(query);
                
                const matchesMenu = rest.menu.some(item => 
                    item.name.toLowerCase().includes(query) || 
                    item.category.toLowerCase().includes(query)
                );

                if (!matchesRestInfo && !matchesMenu) return false;
            }

            return true;
        });

        // Render current view mode
        renderRestaurants(filtered);
        renderFoodSearch(filtered);
        updateMapMarkers(filtered);
    }

    // Render Restaurant Cards
    function renderRestaurants(restaurants) {
        if (!restaurantGrid) return;
        restaurantGrid.innerHTML = '';
        if (restaurants.length === 0) {
            restaurantGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">
                    <p>🔍 No restaurants match your current area or criteria.</p>
                </div>
            `;
            return;
        }

        // Render top 80 restaurants for maximum UI responsiveness
        const displayLimit = restaurants.slice(0, 80);

        displayLimit.forEach(rest => {
            const card = document.createElement('div');
            card.className = 'restaurant-card animate-fade-in';
            
            const isFav = isFavoriteRestaurant(rest.id);

            let mainImg = 'images/default_food.png';
            const hasMainImage = rest.menu.find(item => item.image_url && !item.image_url.includes('default'));
            if (hasMainImage) {
                mainImg = hasMainImage.image_url;
            }

            const delTag = rest.delivery_available ? `<span class="service-tag">🛵 Delivery</span>` : '';
            const dineTag = rest.dine_in_available ? `<span class="service-tag">🍽️ Dine-in</span>` : '';

            card.innerHTML = `
                <div class="restaurant-card-img-wrapper">
                    <button class="fav-btn-absolute ${isFav ? 'is-fav' : ''}" onclick="toggleFavoriteRestaurant('${rest.id}')" title="Save to favorites">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                    </button>
                    <span class="restaurant-rating-badge">⭐ ${rest.rating}</span>
                    <img src="${mainImg}" alt="${rest.name}" class="restaurant-card-img" onerror="this.src='images/default_food.png'" />
                </div>
                <div class="restaurant-card-body">
                    <h3 class="restaurant-card-title">${rest.name}</h3>
                    <p class="restaurant-card-cuisine">${rest.cuisine}</p>
                    <p class="restaurant-card-location">📍 ${rest.location || rest.area}, ${rest.city || 'Dhaka'}</p>
                    <div class="badge-services">${delTag}${dineTag}</div>
                    <div class="restaurant-card-footer" style="margin-top: 8px;">
                        <span class="restaurant-price-badge">${rest.price_range}</span>
                        <button class="btn-explore-menu" onclick="openMenuModal('${rest.id}')">Explore Menu</button>
                    </div>
                </div>
            `;
            restaurantGrid.appendChild(card);
        });
    }

    // Render Direct Food Search View Grid
    function renderFoodSearch(restaurants) {
        if (!foodSearchGrid) return;
        foodSearchGrid.innerHTML = '';

        const query = searchInput.value.trim().toLowerCase();
        const maxBudget = parseInt(priceRange.value, 10);
        const vegOnly = vegFilter.checked;
        const gfOnly = glutenFilter.checked;
        const inStockOnly = availableFilter.checked;

        const allMatchingItems = [];

        restaurants.forEach(rest => {
            rest.menu.forEach(item => {
                const matchesCat = activeCategory === 'all' || 
                    item.category.toLowerCase().includes(activeCategory.toLowerCase());
                const matchesPrice = item.price <= maxBudget;
                const matchesVeg = !vegOnly || item.dietary_tags.includes('Veg');
                const matchesGf = !gfOnly || item.dietary_tags.includes('Gluten-Free');
                const matchesStock = !inStockOnly || item.available;

                let matchesSearch = true;
                if (query) {
                    matchesSearch = item.name.toLowerCase().includes(query) ||
                                 item.category.toLowerCase().includes(query) ||
                                 item.description.toLowerCase().includes(query) ||
                                 rest.name.toLowerCase().includes(query) ||
                                 rest.location.toLowerCase().includes(query);
                }

                if (matchesCat && matchesPrice && matchesVeg && matchesGf && matchesStock && matchesSearch) {
                    allMatchingItems.push({ item, rest });
                }
            });
        });

        if (allMatchingItems.length === 0) {
            foodSearchGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">
                    <p>🍕 No food items match your search or filter requirements.</p>
                </div>
            `;
            return;
        }

        allMatchingItems.forEach(({ item, rest }) => {
            const card = document.createElement('div');
            card.className = 'menu-item-card animate-fade-in';

            const isFav = isFavoriteItem(item.id);
            const tagsHtml = item.dietary_tags.map(t => 
                `<span class="tag-diet ${t.toLowerCase().replace(' ', '-')}">${t}</span>`
            ).join('');

            card.innerHTML = `
                <div class="menu-item-img-wrapper">
                    <span class="stock-badge ${item.available ? 'in-stock' : 'out-of-stock'}">
                        ${item.available ? 'In Stock' : 'Out of Stock'}
                    </span>
                    <img src="${item.image_url}" alt="${item.name}" class="menu-item-img" onerror="this.src='images/default_food.png'" />
                </div>
                <div class="menu-item-info">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <h4 class="menu-item-name">${item.name}</h4>
                        <button class="item-fav-btn ${isFav ? 'is-fav' : ''}" onclick="toggleFavoriteItem('${item.id}')" title="Save Favorite">
                            ${isFav ? '💖' : '🖤'}
                        </button>
                    </div>
                    <div class="menu-item-tags">${tagsHtml}</div>
                    <p class="menu-item-desc">${item.description}</p>
                    <p style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 8px;">Served at: <a href="javascript:void(0)" onclick="openMenuModal('${rest.id}')" style="color: var(--accent); text-decoration:none; font-weight:600;">${rest.name} (📍 ${rest.location})</a></p>
                    <div class="menu-item-meta">
                        <span class="menu-item-price">৳ ${item.price}</span>
                    </div>
                </div>
            `;
            foodSearchGrid.appendChild(card);
        });
    }

    // --- Favorites UI Update ---
    function updateFavoritesUI() {
        const favs = getFavorites();
        if (favCountSpan) favCountSpan.innerText = favs.restaurants.length + favs.items.length;

        if (!favRestaurantsGrid || !favItemsGrid) return;
        favRestaurantsGrid.innerHTML = '';
        favItemsGrid.innerHTML = '';

        // Render Saved Restaurants
        const savedRests = allRestaurants.filter(r => favs.restaurants.includes(r.id));
        if (savedRests.length === 0) {
            favRestaurantsGrid.innerHTML = `<p style="grid-column: 1/-1; color: var(--text-muted); font-size: 13px;">No saved restaurants yet.</p>`;
        } else {
            savedRests.forEach(rest => {
                const card = document.createElement('div');
                card.className = 'restaurant-card animate-fade-in';
                
                let mainImg = 'images/default_food.png';
                const hasMainImage = rest.menu.find(item => item.image_url && !item.image_url.includes('default'));
                if (hasMainImage) mainImg = hasMainImage.image_url;

                card.innerHTML = `
                    <div class="restaurant-card-img-wrapper">
                        <button class="fav-btn-absolute is-fav" onclick="toggleFavoriteRestaurant('${rest.id}')">
                            <svg viewBox="0 0 24 24" width="16" height="16">
                                <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                        </button>
                        <span class="restaurant-rating-badge">⭐ ${rest.rating}</span>
                        <img src="${mainImg}" alt="${rest.name}" class="restaurant-card-img" onerror="this.src='images/default_food.png'" />
                    </div>
                    <div class="restaurant-card-body">
                        <h3 class="restaurant-card-title">${rest.name}</h3>
                        <p class="restaurant-card-cuisine">${rest.cuisine}</p>
                        <p class="restaurant-card-location">📍 ${rest.location}</p>
                        <div class="restaurant-card-footer">
                            <span class="restaurant-price-badge">${rest.price_range}</span>
                            <button class="btn-explore-menu" onclick="openMenuModal('${rest.id}')">Explore Menu</button>
                        </div>
                    </div>
                `;
                favRestaurantsGrid.appendChild(card);
            });
        }

        // Render Saved Menu Items
        const savedItems = [];
        allRestaurants.forEach(rest => {
            rest.menu.forEach(item => {
                if (favs.items.includes(item.id)) {
                    savedItems.push({ item, restName: rest.name, restId: rest.id });
                }
            });
        });

        if (savedItems.length === 0) {
            favItemsGrid.innerHTML = `<p style="grid-column: 1/-1; color: var(--text-muted); font-size: 13px;">No saved menu items yet.</p>`;
        } else {
            savedItems.forEach(({ item, restName, restId }) => {
                const card = document.createElement('div');
                card.className = 'menu-item-card animate-fade-in';
                
                const tagsHtml = item.dietary_tags.map(t => 
                    `<span class="tag-diet ${t.toLowerCase().replace(' ', '-')}">${t}</span>`
                ).join('');

                card.innerHTML = `
                    <div class="menu-item-img-wrapper">
                        <span class="stock-badge ${item.available ? 'in-stock' : 'out-of-stock'}">
                            ${item.available ? 'In Stock' : 'Out of Stock'}
                        </span>
                        <img src="${item.image_url}" alt="${item.name}" class="menu-item-img" onerror="this.src='images/default_food.png'" />
                    </div>
                    <div class="menu-item-info">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                            <h4 class="menu-item-name">${item.name}</h4>
                            <button class="item-fav-btn is-fav" onclick="toggleFavoriteItem('${item.id}')" title="Remove Favorite">
                                💖
                            </button>
                        </div>
                        <div class="menu-item-tags">${tagsHtml}</div>
                        <p class="menu-item-desc">${item.description}</p>
                        <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">From: <a href="javascript:void(0)" onclick="openMenuModal('${restId}')" style="color: var(--accent); text-decoration:none;">${restName}</a></p>
                        <div class="menu-item-meta">
                            <span class="menu-item-price">৳ ${item.price}</span>
                        </div>
                    </div>
                `;
                favItemsGrid.appendChild(card);
            });
        }
    }

    // --- Modal Logic ---
    function openMenuModal(restaurantId) {
        const rest = allRestaurants.find(r => r.id === restaurantId);
        if (!rest) return;

        currentSelectedRestaurant = rest;

        // Set text
        modalRestaurantName.innerText = rest.name;
        modalCuisine.innerText = rest.cuisine;
        modalLocation.innerText = rest.location;
        modalRating.innerText = rest.rating;
        modalReviewsCount.innerText = rest.review_count;
        modalPriceRange.innerText = rest.price_range;
        if (modalHours) modalHours.innerText = rest.opening_hours || '10:00 AM - 11:00 PM';
        if (modalContact) modalContact.innerText = rest.contact || '+880 1700-000000';
        
        // Maps link
        modalMapsLink.href = rest.google_maps_url;

        // Favorite status
        const isFav = isFavoriteRestaurant(rest.id);
        modalFavBtn.className = `action-btn fav-btn ${isFav ? 'is-fav' : ''}`;

        // Populate reviews list
        modalReviewsList.innerHTML = '';
        if (rest.reviews && rest.reviews.length > 0) {
            rest.reviews.forEach(rev => {
                const revCard = document.createElement('div');
                revCard.className = 'review-card';
                revCard.innerHTML = `
                    <div class="review-user">
                        <span>${rev.user}</span>
                        <span style="color:#fbbf24;">⭐ ${rev.rating}</span>
                    </div>
                    <p class="review-text">"${rev.text}"</p>
                `;
                modalReviewsList.appendChild(revCard);
            });
        }

        // Reset search field
        modalMenuSearch.value = '';

        // Populate menu items
        renderModalMenuItems(rest.menu);

        // Display modal
        menuModal.classList.add('active');
    }

    function renderModalMenuItems(menuList) {
        modalMenuItemsGrid.innerHTML = '';
        const searchVal = modalMenuSearch.value.trim().toLowerCase();

        const filteredMenu = menuList.filter(item => {
            if (searchVal) {
                return item.name.toLowerCase().includes(searchVal) || 
                       item.description.toLowerCase().includes(searchVal) ||
                       item.category.toLowerCase().includes(searchVal);
            }
            return true;
        });

        if (filteredMenu.length === 0) {
            modalMenuItemsGrid.innerHTML = `<p style="grid-column: 1/-1; color: var(--text-muted); text-align: center; padding: 20px;">No items match your search.</p>`;
            return;
        }

        filteredMenu.forEach(item => {
            const card = document.createElement('div');
            card.className = 'menu-item-card animate-fade-in';
            
            const isFav = isFavoriteItem(item.id);
            const tagsHtml = item.dietary_tags.map(t => 
                `<span class="tag-diet ${t.toLowerCase().replace(' ', '-')}">${t}</span>`
            ).join('');

            const popBadgeHtml = item.popularity_badge && item.popularity_badge !== 'Regular' 
                ? `<span class="badge-popularity ${item.popularity_badge.toLowerCase().replace(' ', '-')}">${item.popularity_badge}</span>`
                : '';

            card.innerHTML = `
                <div class="menu-item-img-wrapper" style="position:relative;">
                    ${popBadgeHtml}
                    <span class="stock-badge ${item.available ? 'in-stock' : 'out-of-stock'}">
                        ${item.available ? 'In Stock' : 'Out of Stock'}
                    </span>
                    <img src="${item.image_url}" alt="${item.name}" class="menu-item-img" onerror="this.src='images/default_food.png'" />
                </div>
                <div class="menu-item-info">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <h4 class="menu-item-name">${item.name}</h4>
                        <button class="item-fav-btn ${isFav ? 'is-fav' : ''}" onclick="toggleFavoriteItem('${item.id}')" title="Save Favorite">
                            ${isFav ? '💖' : '🖤'}
                        </button>
                    </div>
                    <div class="menu-item-tags">${tagsHtml}</div>
                    <p class="menu-item-desc">${item.description}</p>
                    <div class="menu-item-meta">
                        <span class="menu-item-price">৳ ${item.price}</span>
                    </div>
                </div>
            `;
            modalMenuItemsGrid.appendChild(card);
        });
    }

    // Expose openMenuModal globally
    window.openMenuModal = openMenuModal;

    // Search filter within modal menu
    modalMenuSearch.addEventListener('input', () => {
        if (currentSelectedRestaurant) {
            renderModalMenuItems(currentSelectedRestaurant.menu);
        }
    });

    // Close Modal triggers
    modalCloseBtn.addEventListener('click', () => menuModal.classList.remove('active'));
    menuModal.addEventListener('click', (e) => {
        if (e.target === menuModal) menuModal.classList.remove('active');
    });

    // Favorite toggle inside modal header
    modalFavBtn.addEventListener('click', () => {
        if (currentSelectedRestaurant) {
            toggleFavoriteRestaurant(currentSelectedRestaurant.id);
        }
    });

    // --- Search & Filters Event Listeners ---
    searchInput.addEventListener('input', applyFilters);
    if (cityFilter) cityFilter.addEventListener('change', applyFilters);
    if (locationFilter) locationFilter.addEventListener('change', () => {
        // Sync active chip
        const loc = locationFilter.value;
        if (areaChipsContainer) {
            areaChipsContainer.querySelectorAll('.area-chip').forEach(chip => {
                chip.classList.toggle('active', chip.dataset.area === loc);
            });
        }
        applyFilters();
    });
    if (cuisineFilter) cuisineFilter.addEventListener('change', applyFilters);
    priceRange.addEventListener('input', () => {
        priceVal.innerText = priceRange.value;
        applyFilters();
    });
    vegFilter.addEventListener('change', applyFilters);
    glutenFilter.addEventListener('change', applyFilters);
    availableFilter.addEventListener('change', applyFilters);

    filterToggleBtn.addEventListener('click', () => {
        filtersDrawer.classList.toggle('active');
        filterToggleBtn.classList.toggle('active');
    });

    // Category pills events
    categoryPills.addEventListener('click', (e) => {
        const pill = e.target.closest('.pill');
        if (!pill) return;

        categoryPills.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeCategory = pill.dataset.category;
        applyFilters();
    });

    // Area quick chips events
    if (areaChipsContainer) {
        areaChipsContainer.addEventListener('click', (e) => {
            const chip = e.target.closest('.area-chip');
            if (!chip) return;

            areaChipsContainer.querySelectorAll('.area-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            
            const area = chip.dataset.area;
            if (locationFilter) locationFilter.value = area;
            applyFilters();
        });
    }

    // --- Explorer Navigation Views Switching ---
    function setExplorerView(view) {
        activeViewTab = view;
        
        mapViewTab.classList.toggle('active', view === 'map');
        exploreRestaurantsTab.classList.toggle('active', view === 'restaurants');
        foodSearchTab.classList.toggle('active', view === 'food');
        favoritesTab.classList.toggle('active', view === 'favorites');

        mapContainer.classList.toggle('hidden', view !== 'map');
        restaurantGrid.classList.toggle('hidden', view !== 'restaurants');
        foodSearchContainer.classList.toggle('hidden', view !== 'food');
        favoritesContainer.classList.toggle('hidden', view !== 'favorites');

        if (view === 'map' && mapInstance) {
            setTimeout(() => mapInstance.invalidateSize(), 150);
        } else if (view === 'favorites') {
            updateFavoritesUI();
        }
    }

    mapViewTab.addEventListener('click', () => setExplorerView('map'));
    exploreRestaurantsTab.addEventListener('click', () => setExplorerView('restaurants'));
    foodSearchTab.addEventListener('click', () => setExplorerView('food'));
    favoritesTab.addEventListener('click', () => setExplorerView('favorites'));

    // --- Mobile tab navigation handlers ---
    tabChatBtn.addEventListener('click', () => {
        tabChatBtn.classList.add('active');
        tabExploreBtn.classList.remove('active');
        chatPane.classList.add('active');
        explorerPane.classList.remove('active');
    });

    tabExploreBtn.addEventListener('click', () => {
        tabExploreBtn.classList.add('active');
        tabChatBtn.classList.remove('active');
        explorerPane.classList.add('active');
        chatPane.classList.remove('active');
        if (activeViewTab === 'map' && mapInstance) {
            setTimeout(() => mapInstance.invalidateSize(), 150);
        }
    });

    // --- Chat logic ---
    function formatResponseText(text) {
        if (!text) return '';
        let formatted = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/\[Explore Menu:\s*(.*?)\]/g, '<button class="chat-explore-menu-btn" onclick="openMenuModal(\'$1\')">📂 Explore Menu</button>');
        formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="maps-link">🔗 $1</a>');
        formatted = formatted.replace(/\n/g, '<br>');

        return formatted;
    }

    function scrollToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function appendMessage(sender, text) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('message-wrapper', sender, 'animate-fade-in');

        const avatar = document.createElement('div');
        avatar.classList.add('avatar');
        avatar.innerText = sender === 'user' ? '👤' : '🤖';

        const bubble = document.createElement('div');
        bubble.classList.add('message-bubble');
        
        const content = document.createElement('p');
        content.innerHTML = formatResponseText(text);
        
        bubble.appendChild(content);
        wrapper.appendChild(avatar);
        wrapper.appendChild(bubble);
        chatContainer.appendChild(wrapper);
        
        scrollToBottom();
        return wrapper;
    }

    function appendTypingIndicator() {
        const wrapper = document.createElement('div');
        wrapper.classList.add('message-wrapper', 'assistant', 'animate-fade-in');
        wrapper.id = 'typing-indicator-wrapper';

        const avatar = document.createElement('div');
        avatar.classList.add('avatar');
        avatar.innerText = '🤖';

        const bubble = document.createElement('div');
        bubble.classList.add('message-bubble');

        const indicator = document.createElement('div');
        indicator.classList.add('typing-indicator');
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.classList.add('typing-dot');
            indicator.appendChild(dot);
        }

        bubble.appendChild(indicator);
        wrapper.appendChild(avatar);
        wrapper.appendChild(bubble);
        chatContainer.appendChild(wrapper);
        
        scrollToBottom();
        return wrapper;
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator-wrapper');
        if (indicator) {
            indicator.remove();
        }
    }

    let conversationHistory = [
        {
            role: "model",
            parts: [{ text: "Welcome! I am RestoFinder AI, your personal Dhaka Dining Assistant. Ask me for recommendations like \"Best Kacchi Biryani under ৳400 in Old Dhaka\" or search restaurants on the interactive map! 🗺️🍔🍛" }]
        }
    ];

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const message = userInput.value.trim();
        if (!message) return;

        userInput.value = '';
        userInput.disabled = true;
        sendButton.disabled = true;

        appendMessage('user', message);
        conversationHistory.push({
            role: 'user',
            parts: [{ text: message }]
        });

        appendTypingIndicator();

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ contents: conversationHistory })
            });

            if (!response.ok) {
                let errorMsg = `Server error (status: ${response.status})`;
                try {
                    const errData = await response.json();
                    errorMsg = errData.detail || errorMsg;
                } catch (_) {}
                throw new Error(errorMsg);
            }

            const data = await response.json();
            removeTypingIndicator();
            const botResponse = data.response || 'I did not receive a response. Please try again.';
            appendMessage('assistant', botResponse);

            conversationHistory.push({
                role: 'model',
                parts: [{ text: botResponse }]
            });

        } catch (error) {
            console.error('Error contacting RestoFinder AI:', error);
            removeTypingIndicator();
            
            let messageToDisplay = error.message;
            if (error.message.includes('Failed to fetch')) {
                messageToDisplay = 'Connection error: I was unable to connect to the backend server. Please verify the FastAPI server is running on `http://localhost:8000`.';
            }
            
            appendMessage(
                'assistant', 
                `⚠️ **Error**: ${messageToDisplay}`
            );
            conversationHistory.pop();
        } finally {
            userInput.disabled = false;
            sendButton.disabled = false;
            userInput.focus();
            scrollToBottom();
        }
    });

    // --- Suggestion Chips Click Logic ---
    const suggestionChipsContainer = document.querySelector('.suggestion-chips');
    if (suggestionChipsContainer) {
        suggestionChipsContainer.addEventListener('click', (e) => {
            const chip = e.target.closest('.chip-btn');
            if (!chip) return;

            const query = chip.dataset.query;
            userInput.value = query;
            chatForm.dispatchEvent(new Event('submit'));
            
            if (window.innerWidth <= 900) {
                tabChatBtn.click();
            }
        });
    }

    // Initialize Page Data
    loadRestaurants();
});
