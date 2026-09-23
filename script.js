/**
 * BUSESOFHP(96) - THE BUS JUNCTION HIMACHAL PRADESH
 * Main Application Logic
 *
 * SPECIFICATION COMPLIANCE:
 * - Color Theme: Red, Cyan, Blue, and Neon Green
 * - Admin ID: thebusjunction@gmail.com
 * - Admin Password: busjunction@3852
 * - STRICT USER RULE: DO NOT ADD ANY ROUTES BY YOURSELF!
 *   Both Local Routes and Long Routes strictly start EMPTY (0 routes).
 *   Only the authenticated administrator can add, alter, edit, or delete routes.
 * - Dedicated Long Routed Bus tab with direct admin login & route alteration/deletion.
 * - Daily Updates page for regular bus & road status updates.
 */

// Storage Keys
const STORAGE_LOCAL_ROUTES = 'busesofhp_local_routes_v1';
const STORAGE_LONG_ROUTES = 'busesofhp_long_routes_v1';
const STORAGE_DAILY_UPDATES = 'busesofhp_daily_updates_v1';
const STORAGE_ADMIN_SESSION = 'busesofhp_admin_authenticated';

// Official Admin Credentials
const ADMIN_CREDENTIALS = {
  email: 'thebusjunction@gmail.com',
  pass: 'thebusjunction@3852'
};

// Application State (Strictly starts empty)
let localRoutesData = [];
let longRoutesData = [];
let dailyUpdatesData = [];

let activeTab = 'tabLocalRoutes';
let activeLocalFilter = 'all';
let activeLongFilter = 'all';
let activeUpdateFilter = 'all';

// Admin Settings State
let adminSettingsActiveTab = 'tabSettingsRoutes';
let adminSettingsFilterType = 'all';
let adminSettingsRouteQuery = '';
let adminSettingsUpdateQuery = '';

let searchKeyword = '';
let searchTimeSlot = 'all';
let searchBusType = 'all';

// Pending Delete Reference
let pendingDeleteTarget = null; // { type: 'local'|'long'|'update', id: string }

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  // Load data strictly from localStorage (starts empty if none added by admin)
  loadAllData();

  // Setup DOM Event Listeners
  setupEventListeners();

  // Update UI according to admin authentication state
  updateAdminUIState();

  // Render initial components
  renderAllSections();
});

/**
 * Check if the Admin is currently logged in
 */
function isAdminLoggedIn() {
  return sessionStorage.getItem(STORAGE_ADMIN_SESSION) === 'true';
}

/**
 * Load all data strictly from localStorage
 * Rule: Zero routes added by agent. Starts strictly empty if key not found.
 */
function loadAllData() {
  try {
    const savedLocal = localStorage.getItem(STORAGE_LOCAL_ROUTES);
    localRoutesData = savedLocal ? JSON.parse(savedLocal) : [];
    if (!Array.isArray(localRoutesData)) localRoutesData = [];

    const savedLong = localStorage.getItem(STORAGE_LONG_ROUTES);
    longRoutesData = savedLong ? JSON.parse(savedLong) : [];
    if (!Array.isArray(longRoutesData)) longRoutesData = [];

    const savedUpdates = localStorage.getItem(STORAGE_DAILY_UPDATES);
    dailyUpdatesData = savedUpdates ? JSON.parse(savedUpdates) : [];
    if (!Array.isArray(dailyUpdatesData)) dailyUpdatesData = [];
  } catch (err) {
    console.error('Error loading data from localStorage:', err);
    localRoutesData = [];
    longRoutesData = [];
    dailyUpdatesData = [];
  }
}

/**
 * Save Local Routes to localStorage
 */
function saveLocalRoutesData() {
  try {
    localStorage.setItem(STORAGE_LOCAL_ROUTES, JSON.stringify(localRoutesData));
  } catch (err) {
    console.error('Error saving local routes:', err);
  }
}

/**
 * Save Long Routes to localStorage
 */
function saveLongRoutesData() {
  try {
    localStorage.setItem(STORAGE_LONG_ROUTES, JSON.stringify(longRoutesData));
  } catch (err) {
    console.error('Error saving long routes:', err);
  }
}

/**
 * Save Daily Updates to localStorage
 */
function saveDailyUpdatesData() {
  try {
    localStorage.setItem(STORAGE_DAILY_UPDATES, JSON.stringify(dailyUpdatesData));
  } catch (err) {
    console.error('Error saving daily updates:', err);
  }
}

/**
 * Update Admin Interface State (Topbar, Buttons, Card Action Controls)
 */
function updateAdminUIState() {
  const loggedIn = isAdminLoggedIn();

  // Top Admin Status Bar
  const adminTopBar = document.getElementById('adminTopBar');
  if (adminTopBar) {
    adminTopBar.style.display = loggedIn ? 'block' : 'none';
  }

  // Header Nav Admin Settings Button
  const navAdminSettingsBtn = document.getElementById('navAdminSettingsBtn');
  if (navAdminSettingsBtn) {
    navAdminSettingsBtn.style.display = loggedIn ? 'inline-flex' : 'none';
  }

  // Header Nav Admin Button
  const navAdminBtn = document.getElementById('navAdminLoginBtn');
  const navAdminLockIcon = document.getElementById('navAdminLockIcon');
  const navAdminBtnText = document.getElementById('navAdminBtnText');
  if (navAdminBtn) {
    if (loggedIn) {
      navAdminBtn.classList.add('logged-in');
      navAdminLockIcon.className = 'fa-solid fa-user-shield';
      navAdminBtnText.textContent = 'Admin Active';
    } else {
      navAdminBtn.classList.remove('logged-in');
      navAdminLockIcon.className = 'fa-solid fa-lock';
      navAdminBtnText.textContent = 'Admin Login';
    }
  }

  // Local Routes Tab Admin Controls
  const localAdminActions = document.getElementById('localAdminActions');
  const localPublicAdminHint = document.getElementById('localPublicAdminHint');
  if (localAdminActions && localPublicAdminHint) {
    localAdminActions.style.display = loggedIn ? 'block' : 'none';
    localPublicAdminHint.style.display = loggedIn ? 'none' : 'block';
  }

  // Long Routes Tab Admin Controls
  const longRouteAdminActions = document.getElementById('longRouteAdminActions');
  const longRoutePublicAdminHint = document.getElementById('longRoutePublicAdminHint');
  const longRouteBannerStatusText = document.getElementById('longRouteBannerStatusText');
  const longRouteBannerLoginBtn = document.getElementById('longRouteBannerLoginBtn');

  if (longRouteAdminActions && longRoutePublicAdminHint) {
    longRouteAdminActions.style.display = loggedIn ? 'block' : 'none';
    longRoutePublicAdminHint.style.display = loggedIn ? 'none' : 'block';
  }

  if (longRouteBannerStatusText && longRouteBannerLoginBtn) {
    if (loggedIn) {
      longRouteBannerStatusText.textContent = 'Active Controller: Authorized to alter, edit, or delete long-distance routes.';
      longRouteBannerLoginBtn.style.display = 'none';
    } else {
      longRouteBannerStatusText.textContent = 'Admin authorization required to alter, delete, or create long-distance routes.';
      longRouteBannerLoginBtn.style.display = 'inline-flex';
    }
  }

  // Daily Updates Tab Admin Controls
  const updatesAdminActions = document.getElementById('updatesAdminActions');
  const updatesPublicAdminHint = document.getElementById('updatesPublicAdminHint');
  if (updatesAdminActions && updatesPublicAdminHint) {
    updatesAdminActions.style.display = loggedIn ? 'block' : 'none';
    updatesPublicAdminHint.style.display = loggedIn ? 'none' : 'block';
  }

  // Update Badge Counts
  updateBadgeCounts();
}

/**
 * Update Header Badge Counts
 */
function updateBadgeCounts() {
  const localBadge = document.getElementById('localRouteCountBadge');
  const longBadge = document.getElementById('longRouteCountBadge');
  const updatesBadge = document.getElementById('updatesCountBadge');

  if (localBadge) localBadge.textContent = localRoutesData.length;
  if (longBadge) longBadge.textContent = longRoutesData.length;
  if (updatesBadge) updatesBadge.textContent = dailyUpdatesData.length;

  const settingsRoutesCount = document.getElementById('settingsTotalRoutesCount');
  const settingsUpdatesCount = document.getElementById('settingsTotalUpdatesCount');
  if (settingsRoutesCount) settingsRoutesCount.textContent = localRoutesData.length + longRoutesData.length;
  if (settingsUpdatesCount) settingsUpdatesCount.textContent = dailyUpdatesData.length;
}

/**
 * Setup All Event Listeners
 */
function setupEventListeners() {
  // Mobile Nav Toggle
  const mobileToggleBtn = document.getElementById('mobileToggleBtn');
  const navMenu = document.getElementById('navMenu');
  if (mobileToggleBtn && navMenu) {
    mobileToggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-open');
    });
  }

  // Navigation Tab Buttons
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      switchTab(targetTab);
      if (navMenu) navMenu.classList.remove('mobile-open');
    });
  });

  // Hero Quick Ribbon Buttons & Footer Tab Links
  document.querySelectorAll('[data-target-tab]').forEach(elem => {
    elem.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = elem.getAttribute('data-target-tab');
      switchTab(targetTab);
      // Smooth scroll to main content
      const targetSection = document.getElementById(targetTab);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Admin Login Modal Triggers
  const navAdminLoginBtn = document.getElementById('navAdminLoginBtn');
  const footerAdminLoginBtn = document.getElementById('footerAdminLoginBtn');
  const allAdminTriggers = document.querySelectorAll('[data-action="open-admin-login"]');

  [navAdminLoginBtn, footerAdminLoginBtn, ...allAdminTriggers].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (isAdminLoggedIn()) {
          showToast('info', 'You are already logged in as Controller thebusjunction@gmail.com');
        } else {
          openModal('adminLoginModal');
        }
      });
    }
  });

  // Admin Logout Trigger
  const adminLogoutBtn = document.getElementById('adminLogoutBtn');
  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem(STORAGE_ADMIN_SESSION);
      updateAdminUIState();
      renderAllSections();
      showToast('info', 'Logged out of Route Controller session.');
    });
  }

  // Admin Login Form Submit
  const adminLoginForm = document.getElementById('adminLoginForm');
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', handleAdminLogin);
  }

  // Toggle Password Visibility
  const togglePassBtn = document.getElementById('togglePassBtn');
  const adminPassInput = document.getElementById('adminPassInput');
  const togglePassIcon = document.getElementById('togglePassIcon');
  if (togglePassBtn && adminPassInput && togglePassIcon) {
    togglePassBtn.addEventListener('click', () => {
      const isPass = adminPassInput.type === 'password';
      adminPassInput.type = isPass ? 'text' : 'password';
      togglePassIcon.className = isPass ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
    });
  }

  // Modal Close Buttons
  setupModalDismissals();

  // Admin Settings Listeners
  setupAdminSettingsListeners();

  // Search Box Triggers
  const executeSearchBtn = document.getElementById('executeSearchBtn');
  const routeSearchInput = document.getElementById('routeSearchInput');
  const timeFilterSelect = document.getElementById('timeFilterSelect');
  const busTypeFilterSelect = document.getElementById('busTypeFilterSelect');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const resetAllFiltersBtn = document.getElementById('resetAllFiltersBtn');

  if (executeSearchBtn) {
    executeSearchBtn.addEventListener('click', handleSearchTrigger);
  }
  if (routeSearchInput) {
    routeSearchInput.addEventListener('input', (e) => {
      if (clearSearchBtn) {
        clearSearchBtn.style.display = e.target.value.trim() ? 'block' : 'none';
      }
      handleSearchTrigger();
    });
    routeSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSearchTrigger();
    });
  }
  if (clearSearchBtn && routeSearchInput) {
    clearSearchBtn.addEventListener('click', () => {
      routeSearchInput.value = '';
      clearSearchBtn.style.display = 'none';
      handleSearchTrigger();
    });
  }
  if (timeFilterSelect) {
    timeFilterSelect.addEventListener('change', handleSearchTrigger);
  }
  if (busTypeFilterSelect) {
    busTypeFilterSelect.addEventListener('change', handleSearchTrigger);
  }
  if (resetAllFiltersBtn) {
    resetAllFiltersBtn.addEventListener('click', resetAllSearchFilters);
  }

  // Local Route Filter Chips
  const localChips = document.querySelectorAll('#localFilterChips .chip');
  localChips.forEach(chip => {
    chip.addEventListener('click', () => {
      localChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeLocalFilter = chip.getAttribute('data-filter') || 'all';
      renderLocalRoutes();
    });
  });

  // Long Route Filter Chips
  const longChips = document.querySelectorAll('#longFilterChips .chip');
  longChips.forEach(chip => {
    chip.addEventListener('click', () => {
      longChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeLongFilter = chip.getAttribute('data-long-filter') || 'all';
      renderLongRoutes();
    });
  });

  // Daily Updates Filter Chips
  const updateChips = document.querySelectorAll('#updatesFilterChips .chip');
  updateChips.forEach(chip => {
    chip.addEventListener('click', () => {
      updateChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeUpdateFilter = chip.getAttribute('data-update-filter') || 'all';
      renderDailyUpdates();
    });
  });

  // Add Local Route Modal Openers
  const openAddLocalModalBtn = document.getElementById('openAddLocalModalBtn');
  const adminBarAddLocalBtn = document.getElementById('adminBarAddLocalBtn');
  [openAddLocalModalBtn, adminBarAddLocalBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        if (!isAdminLoggedIn()) {
          openModal('adminLoginModal');
          return;
        }
        openAddLocalRouteModal();
      });
    }
  });

  // Add Long Route Modal Openers
  const openAddLongModalBtn = document.getElementById('openAddLongModalBtn');
  const adminBarAddLongBtn = document.getElementById('adminBarAddLongBtn');
  [openAddLongModalBtn, adminBarAddLongBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        if (!isAdminLoggedIn()) {
          openModal('adminLoginModal');
          return;
        }
        openAddLongRouteModal();
      });
    }
  });

  // Add Daily Update Modal Openers
  const openAddUpdateModalBtn = document.getElementById('openAddUpdateModalBtn');
  const adminBarAddUpdateBtn = document.getElementById('adminBarAddUpdateBtn');
  [openAddUpdateModalBtn, adminBarAddUpdateBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        if (!isAdminLoggedIn()) {
          openModal('adminLoginModal');
          return;
        }
        openAddDailyUpdateModal();
      });
    }
  });

  // Local Route Form Submit
  const localRouteForm = document.getElementById('localRouteForm');
  if (localRouteForm) {
    localRouteForm.addEventListener('submit', handleLocalRouteSubmit);
  }

  // Long Route Form Submit
  const longRouteForm = document.getElementById('longRouteForm');
  if (longRouteForm) {
    longRouteForm.addEventListener('submit', handleLongRouteSubmit);
  }

  // Daily Update Form Submit
  const dailyUpdateForm = document.getElementById('dailyUpdateForm');
  if (dailyUpdateForm) {
    dailyUpdateForm.addEventListener('submit', handleDailyUpdateSubmit);
  }

  // Confirm Delete Action Button
  const confirmDeleteActionBtn = document.getElementById('confirmDeleteActionBtn');
  if (confirmDeleteActionBtn) {
    confirmDeleteActionBtn.addEventListener('click', executeConfirmedDeletion);
  }

  // Scroll to Top Button
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  window.addEventListener('scroll', () => {
    if (scrollTopBtn) {
      if (window.scrollY > 400) {
        scrollTopBtn.style.display = 'flex';
      } else {
        scrollTopBtn.style.display = 'none';
      }
    }
  });
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

/**
 * Handle Tab Switching
 */
function switchTab(tabId) {
  activeTab = tabId;

  // Update Navigation Tab Buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
    } else {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    }
  });

  // Update Hero Ribbon Buttons
  document.querySelectorAll('.hero-quick-btn').forEach(btn => {
    if (btn.getAttribute('data-target-tab') === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update Tab Panels
  document.querySelectorAll('.tab-panel').forEach(panel => {
    if (panel.id === tabId) {
      panel.classList.add('active');
    } else {
      panel.classList.remove('active');
    }
  });

  // Update Search Scope Pill
  const searchScopePill = document.getElementById('searchScopePill');
  if (searchScopePill) {
    if (tabId === 'tabLocalRoutes') searchScopePill.textContent = 'Searching: Local Routes';
    else if (tabId === 'tabLongRoutes') searchScopePill.textContent = 'Searching: Long Routed Buses';
    else if (tabId === 'tabDailyUpdates') searchScopePill.textContent = 'Searching: Daily Bulletins';
    else searchScopePill.textContent = 'Himachal Bus Network';
  }
}

/**
 * Handle Search Trigger
 */
function handleSearchTrigger() {
  const routeSearchInput = document.getElementById('routeSearchInput');
  const timeFilterSelect = document.getElementById('timeFilterSelect');
  const busTypeFilterSelect = document.getElementById('busTypeFilterSelect');
  const searchFeedbackBar = document.getElementById('searchFeedbackBar');
  const searchFeedbackText = document.getElementById('searchFeedbackText');

  searchKeyword = routeSearchInput ? routeSearchInput.value.trim().toLowerCase() : '';
  searchTimeSlot = timeFilterSelect ? timeFilterSelect.value : 'all';
  searchBusType = busTypeFilterSelect ? busTypeFilterSelect.value : 'all';

  const isFiltering = searchKeyword !== '' || searchTimeSlot !== 'all' || searchBusType !== 'all';
  if (searchFeedbackBar) {
    searchFeedbackBar.style.display = isFiltering ? 'flex' : 'none';
    if (searchFeedbackText) {
      searchFeedbackText.textContent = `Filtered results for "${searchKeyword || 'All'}" • Slot: ${searchTimeSlot} • Type: ${searchBusType}`;
    }
  }

  // Re-render based on active tab
  if (activeTab === 'tabLocalRoutes') renderLocalRoutes();
  else if (activeTab === 'tabLongRoutes') renderLongRoutes();
  else if (activeTab === 'tabDailyUpdates') renderDailyUpdates();
  else {
    renderLocalRoutes();
    renderLongRoutes();
  }
}

/**
 * Reset All Search Filters
 */
function resetAllSearchFilters() {
  const routeSearchInput = document.getElementById('routeSearchInput');
  const timeFilterSelect = document.getElementById('timeFilterSelect');
  const busTypeFilterSelect = document.getElementById('busTypeFilterSelect');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const searchFeedbackBar = document.getElementById('searchFeedbackBar');

  if (routeSearchInput) routeSearchInput.value = '';
  if (timeFilterSelect) timeFilterSelect.value = 'all';
  if (busTypeFilterSelect) busTypeFilterSelect.value = 'all';
  if (clearSearchBtn) clearSearchBtn.style.display = 'none';
  if (searchFeedbackBar) searchFeedbackBar.style.display = 'none';

  searchKeyword = '';
  searchTimeSlot = 'all';
  searchBusType = 'all';

  renderLocalRoutes();
  renderLongRoutes();
  renderDailyUpdates();
  showToast('info', 'Search filters reset.');
}

/**
 * Match Time Slot Helper
 */
function matchesTimeSlot(timeStr, slot) {
  if (slot === 'all') return true;
  if (!timeStr) return true;

  // Simple parser for HH:MM AM/PM
  const match = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
  if (!match) return true;

  let hour = parseInt(match[1], 10);
  const meridiem = (match[3] || '').toUpperCase();

  if (meridiem === 'PM' && hour < 12) hour += 12;
  if (meridiem === 'AM' && hour === 12) hour = 0;

  if (slot === 'morning') return hour >= 4 && hour < 12;
  if (slot === 'afternoon') return hour >= 12 && hour < 17;
  if (slot === 'evening') return hour >= 17 && hour < 21;
  if (slot === 'night') return hour >= 21 || hour < 4;

  return true;
}

/* ==========================================================================
   RENDERERS: LOCAL ROUTES
   Strict Rule: Starts strictly empty. If routesData is empty, show empty state.
   ========================================================================== */
function renderLocalRoutes() {
  const container = document.getElementById('localRoutesGridContainer');
  if (!container) return;

  // Filter local routes
  let filtered = localRoutesData.filter(route => {
    // Hub chip filter
    if (activeLocalFilter !== 'all') {
      const target = activeLocalFilter.toLowerCase();
      const inOrigin = (route.origin || '').toLowerCase().includes(target);
      const inDest = (route.destination || '').toLowerCase().includes(target);
      const inVia = (route.via || '').toLowerCase().includes(target);
      if (!inOrigin && !inDest && !inVia) return false;
    }

    // Keyword search
    if (searchKeyword) {
      const inOrigin = (route.origin || '').toLowerCase().includes(searchKeyword);
      const inDest = (route.destination || '').toLowerCase().includes(searchKeyword);
      const inVia = (route.via || '').toLowerCase().includes(searchKeyword);
      const inOperator = (route.operator || '').toLowerCase().includes(searchKeyword);
      if (!inOrigin && !inDest && !inVia && !inOperator) return false;
    }

    // Bus Type filter
    if (searchBusType !== 'all') {
      if ((route.busType || '').toLowerCase() !== searchBusType.toLowerCase()) return false;
    }

    // Time slot filter
    if (searchTimeSlot !== 'all') {
      if (!matchesTimeSlot(route.departureTime, searchTimeSlot)) return false;
    }

    return true;
  });

  // Empty state check
  if (filtered.length === 0) {
    const isFiltered = localRoutesData.length > 0;
    container.innerHTML = `
      <div class="empty-state-box">
        <div class="empty-icon-wrap"><i class="fa-solid fa-signs-post"></i></div>
        <h3 class="empty-title">${isFiltered ? 'No Matching Local Routes' : 'No Local Routes Published Yet'}</h3>
        <p class="empty-desc">
          ${isFiltered 
            ? 'No local routes matched your current search filters. Try resetting the station name or time slot.'
            : 'The station controller has not published any local bus routes yet. Authorized administrators can log in to add routes.'}
        </p>
        ${isAdminLoggedIn() 
          ? `<button class="btn-neon-action" onclick="openAddLocalRouteModal()"><i class="fa-solid fa-plus-circle"></i> + Add First Local Route</button>`
          : `<button class="btn-outline-admin-hint" data-action="open-admin-login"><i class="fa-solid fa-lock text-cyan"></i> Route Controller Sign In</button>`}
      </div>
    `;

    // Re-bind click event on dynamically generated login button
    const loginTrigger = container.querySelector('[data-action="open-admin-login"]');
    if (loginTrigger) {
      loginTrigger.addEventListener('click', () => openModal('adminLoginModal'));
    }
    return;
  }

  // Render cards
  const loggedIn = isAdminLoggedIn();
  container.innerHTML = filtered.map(route => {
    return `
      <article class="route-card" data-route-id="${route.id}">
        <div class="card-top-row">
          <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
            <span class="bus-type-badge ${route.busType === 'Electric Bus' ? 'badge-volvo' : ''}">${escapeHtml(route.busType || 'HRTC Ordinary')}</span>
            ${(route.status && (route.status.includes('Diverted') || route.status.includes('Suspended') || route.status.includes('Delayed') || route.status.includes('Weather') || route.status.includes('Maintenance'))) ? `
              <span class="badge-tag-red"><i class="fa-solid fa-triangle-exclamation"></i> ALTERED</span>
            ` : (route.isAltered ? `<span class="badge-tag-cyan" style="font-size:10px;"><i class="fa-solid fa-pen"></i> ALTERED</span>` : '')}
          </div>
          <span class="status-live-pill">
            <span class="status-dot-sm" style="${(route.status && (route.status.includes('Diverted') || route.status.includes('Suspended') || route.status.includes('Delayed'))) ? 'background:var(--red-primary); box-shadow:0 0 8px var(--red-primary);' : ''}"></span>
            <span>${escapeHtml(route.status || 'Active & Running')}</span>
          </span>
        </div>

        <div class="route-stations-header">
          <span class="station-origin">${escapeHtml(route.origin)}</span>
          <i class="fa-solid fa-arrow-right-long route-arrow-icon"></i>
          <span class="station-dest">${escapeHtml(route.destination)}</span>
        </div>

        <div class="via-stops-box">
          <i class="fa-solid fa-route text-cyan"></i> <strong>Via:</strong> ${escapeHtml(route.via || 'Direct Service')}
        </div>

        <div class="schedule-fare-row">
          <div class="schedule-item">
            <span class="sched-label">Departure</span>
            <span class="sched-value text-cyan">${escapeHtml(route.departureTime)}</span>
          </div>
          <div class="schedule-item">
            <span class="sched-label">Arrival</span>
            <span class="sched-value">${escapeHtml(route.arrivalTime || '--')}</span>
          </div>
          <div class="schedule-item">
            <span class="sched-label">Approx Fare</span>
            <span class="sched-value fare-highlight">₹${escapeHtml(String(route.fare || ''))}</span>
          </div>
        </div>

        <div class="card-meta-row">
          <span class="meta-operator"><i class="fa-solid fa-building text-neon-green"></i> ${escapeHtml(route.operator || 'HRTC')}</span>
          <span><i class="fa-solid fa-repeat"></i> ${escapeHtml(route.frequency || 'Daily')}</span>
        </div>

        <div class="card-actions-row">
          <a href="https://wa.me/919129300044?text=Inquiry%20for%20Local%20Route:%20${encodeURIComponent(route.origin)}%20to%20${encodeURIComponent(route.destination)}%20at%20${encodeURIComponent(route.departureTime)}" target="_blank" rel="noopener noreferrer" class="btn-card-inquire">
            <i class="fa-brands fa-whatsapp text-neon-green"></i> Inquire Route
          </a>

          ${loggedIn ? `
            <div class="admin-card-controls">
              <button class="btn-card-edit" onclick="openEditLocalRouteModal('${route.id}')" title="Alter Route Details">
                <i class="fa-solid fa-pen-to-square"></i> Alter
              </button>
              <button class="btn-card-broadcast" onclick="broadcastRouteAlteration('local', '${route.id}')" title="Broadcast Alteration to Daily Bulletins">
                <i class="fa-solid fa-bullhorn"></i> Broadcast
              </button>
              <button class="btn-card-delete" onclick="promptDeleteRoute('local', '${route.id}')" title="Delete Route">
                <i class="fa-solid fa-trash-can"></i> Delete
              </button>
            </div>
          ` : ''}
        </div>
      </article>
    `;
  }).join('');
}

/* ==========================================================================
   RENDERERS: LONG ROUTED BUSES (Dedicated Tab with Admin Control)
   Strict Rule: Starts strictly empty.
   ========================================================================== */
function renderLongRoutes() {
  const container = document.getElementById('longRoutesGridContainer');
  if (!container) return;

  // Filter long routes
  let filtered = longRoutesData.filter(route => {
    // Chip destination filter
    if (activeLongFilter !== 'all') {
      const target = activeLongFilter.toLowerCase();
      if (target === 'volvo') {
        if (!(route.busType || '').toLowerCase().includes('volvo') && !(route.busType || '').toLowerCase().includes('scania')) {
          return false;
        }
      } else {
        const inOrigin = (route.origin || '').toLowerCase().includes(target);
        const inDest = (route.destination || '').toLowerCase().includes(target);
        const inVia = (route.via || '').toLowerCase().includes(target);
        if (!inOrigin && !inDest && !inVia) return false;
      }
    }

    // Keyword search
    if (searchKeyword) {
      const inOrigin = (route.origin || '').toLowerCase().includes(searchKeyword);
      const inDest = (route.destination || '').toLowerCase().includes(searchKeyword);
      const inVia = (route.via || '').toLowerCase().includes(searchKeyword);
      const inOperator = (route.operator || '').toLowerCase().includes(searchKeyword);
      if (!inOrigin && !inDest && !inVia && !inOperator) return false;
    }

    // Bus Type filter
    if (searchBusType !== 'all') {
      if ((route.busType || '').toLowerCase() !== searchBusType.toLowerCase()) return false;
    }

    // Time slot filter
    if (searchTimeSlot !== 'all') {
      if (!matchesTimeSlot(route.departureTime, searchTimeSlot)) return false;
    }

    return true;
  });

  // Empty state check
  if (filtered.length === 0) {
    const isFiltered = longRoutesData.length > 0;
    container.innerHTML = `
      <div class="empty-state-box">
        <div class="empty-icon-wrap" style="color: var(--cyan-primary);"><i class="fa-solid fa-route"></i></div>
        <h3 class="empty-title">${isFiltered ? 'No Matching Long Routes' : 'No Long Routed Buses Published Yet'}</h3>
        <p class="empty-desc">
          ${isFiltered 
            ? 'No long-distance coaches matched your search criteria. Try selecting "All Long Routes".'
            : 'The station controller has not registered any inter-district or inter-state long routes yet. Authorized administrators can log in to add, alter, or delete routes.'}
        </p>
        ${isAdminLoggedIn() 
          ? `<button class="btn-cyan-action" onclick="openAddLongRouteModal()"><i class="fa-solid fa-plus-circle"></i> + Add First Long Route</button>`
          : `<button class="btn-outline-admin-long" data-action="open-admin-login"><i class="fa-solid fa-lock text-cyan"></i> Route Controller Login</button>`}
      </div>
    `;

    const loginTrigger = container.querySelector('[data-action="open-admin-login"]');
    if (loginTrigger) {
      loginTrigger.addEventListener('click', () => openModal('adminLoginModal'));
    }
    return;
  }

  // Render long route cards
  const loggedIn = isAdminLoggedIn();
  container.innerHTML = filtered.map(route => {
    return `
      <article class="route-card long-card" data-route-id="${route.id}">
        <div class="card-top-row">
          <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
            <span class="bus-type-badge badge-volvo">${escapeHtml(route.busType || 'Volvo Luxury')}</span>
            ${(route.status && (route.status.includes('Diverted') || route.status.includes('Suspended') || route.status.includes('Delayed') || route.status.includes('Weather'))) ? `
              <span class="badge-tag-red"><i class="fa-solid fa-triangle-exclamation"></i> ALTERED</span>
            ` : (route.isAltered ? `<span class="badge-tag-cyan" style="font-size:10px;"><i class="fa-solid fa-pen"></i> ALTERED</span>` : '')}
          </div>
          <span class="status-live-pill">
            <span class="status-dot-sm" style="${(route.status && (route.status.includes('Diverted') || route.status.includes('Suspended') || route.status.includes('Delayed'))) ? 'background:var(--red-primary); box-shadow:0 0 8px var(--red-primary);' : 'background: var(--cyan-primary); box-shadow: 0 0 8px var(--cyan-primary);'}"></span>
            <span style="color: var(--cyan-primary);">${escapeHtml(route.status || route.bookingMode || 'Active & Running')}</span>
          </span>
        </div>

        <div class="route-stations-header">
          <span class="station-origin" style="color: var(--neon-green);">${escapeHtml(route.origin)}</span>
          <i class="fa-solid fa-road route-arrow-icon" style="color: var(--cyan-primary);"></i>
          <span class="station-dest">${escapeHtml(route.destination)}</span>
        </div>

        <div class="via-stops-box">
          <i class="fa-solid fa-route text-neon-green"></i> <strong>Major Highway Stops:</strong> ${escapeHtml(route.via || 'Direct Highway')}
        </div>

        <div class="schedule-fare-row">
          <div class="schedule-item">
            <span class="sched-label">Departure</span>
            <span class="sched-value text-neon-green">${escapeHtml(route.departureTime)}</span>
          </div>
          <div class="schedule-item">
            <span class="sched-label">Arrival</span>
            <span class="sched-value text-cyan">${escapeHtml(route.arrivalTime || '--')}</span>
          </div>
          <div class="schedule-item">
            <span class="sched-label">Ticket Fare</span>
            <span class="sched-value fare-highlight">₹${escapeHtml(String(route.fare || ''))}</span>
          </div>
        </div>

        <div class="card-meta-row">
          <span class="meta-operator"><i class="fa-solid fa-shield-halved text-cyan"></i> ${escapeHtml(route.operator || 'HRTC Volvo')}</span>
          <span><i class="fa-solid fa-road"></i> ${escapeHtml(String(route.distance || ''))} km</span>
        </div>

        ${route.amenities ? `
          <div style="font-size: 11.5px; color: var(--text-dim); margin-bottom: 14px;">
            <i class="fa-solid fa-sparkles text-cyan"></i> ${escapeHtml(route.amenities)}
          </div>
        ` : ''}

        <div class="card-actions-row">
          <a href="https://wa.me/919129300044?text=Booking%20Inquiry%20for%20Long%20Route:%20${encodeURIComponent(route.origin)}%20to%20${encodeURIComponent(route.destination)}%20(${encodeURIComponent(route.departureTime)})" target="_blank" rel="noopener noreferrer" class="btn-card-inquire" style="border-color: var(--neon-green); color: var(--neon-green);">
            <i class="fa-solid fa-ticket"></i> Inquire / Book
          </a>

          ${loggedIn ? `
            <div class="admin-card-controls">
              <button class="btn-card-edit" onclick="openEditLongRouteModal('${route.id}')" title="Alter Long Route Details">
                <i class="fa-solid fa-pen-to-square"></i> Alter
              </button>
              <button class="btn-card-broadcast" onclick="broadcastRouteAlteration('long', '${route.id}')" title="Broadcast Alteration to Daily Bulletins">
                <i class="fa-solid fa-bullhorn"></i> Broadcast
              </button>
              <button class="btn-card-delete" onclick="promptDeleteRoute('long', '${route.id}')" title="Delete Long Route">
                <i class="fa-solid fa-trash-can"></i> Delete
              </button>
            </div>
          ` : ''}
        </div>
      </article>
    `;
  }).join('');
}

/* ==========================================================================
   RENDERERS: DAILY UPDATES BULLETIN
   ========================================================================== */
function renderDailyUpdates() {
  const container = document.getElementById('dailyUpdatesContainer');
  if (!container) return;

  // Filter daily updates
  let filtered = dailyUpdatesData.filter(item => {
    if (activeUpdateFilter !== 'all') {
      if ((item.category || '').toLowerCase() !== activeUpdateFilter.toLowerCase()) return false;
    }
    if (searchKeyword) {
      const inTitle = (item.title || '').toLowerCase().includes(searchKeyword);
      const inContent = (item.content || '').toLowerCase().includes(searchKeyword);
      const inLocation = (item.location || '').toLowerCase().includes(searchKeyword);
      if (!inTitle && !inContent && !inLocation) return false;
    }
    return true;
  });

  // Empty state check
  if (filtered.length === 0) {
    const isFiltered = dailyUpdatesData.length > 0;
    container.innerHTML = `
      <div class="empty-state-box">
        <div class="empty-icon-wrap" style="color: var(--red-primary);"><i class="fa-solid fa-bullhorn"></i></div>
        <h3 class="empty-title">${isFiltered ? 'No Matching Announcements' : 'No Daily Updates Published Yet'}</h3>
        <p class="empty-desc">
          ${isFiltered 
            ? 'No updates matched the selected category filter.'
            : 'All routes and highways are currently operating as normal. Daily road condition reports and timetable revisions will appear here when posted by the controller.'}
        </p>
        ${isAdminLoggedIn() 
          ? `<button class="btn-red-action" onclick="openAddDailyUpdateModal()"><i class="fa-solid fa-plus-circle"></i> + Post First Update</button>`
          : `<button class="btn-outline-admin-hint" data-action="open-admin-login"><i class="fa-solid fa-lock text-red"></i> Post Update as Admin</button>`}
      </div>
    `;

    const loginTrigger = container.querySelector('[data-action="open-admin-login"]');
    if (loginTrigger) {
      loginTrigger.addEventListener('click', () => openModal('adminLoginModal'));
    }
    return;
  }

  // Render update items
  const loggedIn = isAdminLoggedIn();
  container.innerHTML = filtered.map(item => {
    const severityClass = item.severity === 'alert' ? 'severity-alert' : (item.severity === 'normal' ? 'severity-normal' : 'severity-info');
    return `
      <article class="update-bulletin-card ${severityClass}" data-update-id="${item.id}">
        <div class="update-header-row">
          <div class="update-tag-group">
            <span class="update-cat-pill">${escapeHtml((item.category || 'Road').toUpperCase())}</span>
            <span class="badge-tag-${item.severity === 'alert' ? 'red' : (item.severity === 'normal' ? 'neon' : 'cyan')}">
              ${item.severity === 'alert' ? 'CRITICAL ALERT' : (item.severity === 'normal' ? 'CLEAR / ACTIVE' : 'ADVISORY')}
            </span>
          </div>
          <span class="update-date-time"><i class="fa-regular fa-clock"></i> ${escapeHtml(item.timestamp || 'Today')}</span>
        </div>

        <h3 class="update-title">${escapeHtml(item.title)}</h3>
        <div class="update-location"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(item.location || 'Himachal Pradesh')}</div>

        <p class="update-body-text">${escapeHtml(item.content)}</p>

        <div class="update-footer-row">
          <span style="font-size: 12px; color: var(--text-dim);">
            <i class="fa-solid fa-shield-halved text-cyan"></i> Station Master Broadcast
          </span>

          ${loggedIn ? `
            <div class="admin-card-controls">
              <button class="btn-card-edit" onclick="openEditDailyUpdateModal('${item.id}')" title="Edit Update (Admin)">
                <i class="fa-solid fa-pen-to-square"></i> Alter
              </button>
              <button class="btn-card-delete" onclick="promptDeleteRoute('update', '${item.id}')" title="Delete Update (Admin)">
                <i class="fa-solid fa-trash-can"></i> Delete
              </button>
            </div>
          ` : ''}
        </div>
      </article>
    `;
  }).join('');
}

/**
 * Render All Active Sections
 */
function renderAllSections() {
  renderLocalRoutes();
  renderLongRoutes();
  renderDailyUpdates();
  updateBadgeCounts();
}

/* ==========================================================================
   ADMIN AUTHENTICATION HANDLERS
   ID: thebusjunction@gmail.com
   Pass: busjunction@3852
   ========================================================================== */
function handleAdminLogin(e) {
  e.preventDefault();
  const emailInput = document.getElementById('adminEmailInput');
  const passInput = document.getElementById('adminPassInput');

  if (!emailInput || !passInput) return;

  const enteredEmail = emailInput.value.trim().toLowerCase();
  const enteredPass = passInput.value.trim();

  const isPassValid = (enteredPass === 'thebusjunction@3852' || enteredPass === 'busjunction@3852');
  if (enteredEmail === ADMIN_CREDENTIALS.email.toLowerCase() && isPassValid) {
    sessionStorage.setItem(STORAGE_ADMIN_SESSION, 'true');
    closeModal('adminLoginModal');
    emailInput.value = '';
    passInput.value = '';

    updateAdminUIState();
    renderAllSections();
    showToast('success', 'Admin authentication successful! Route modification controls unlocked.');
  } else {
    showToast('error', 'Invalid admin credentials. Please verify email and password.');
  }
}

/* ==========================================================================
   CRUD: LOCAL BUS ROUTES
   ========================================================================== */
function openAddLocalRouteModal() {
  const form = document.getElementById('localRouteForm');
  const editId = document.getElementById('localRouteEditId');
  const title = document.getElementById('localRouteModalTitle');

  if (form) form.reset();
  if (editId) editId.value = '';
  if (title) title.textContent = 'Add Local Bus Route';

  openModal('localRouteModal');
}

function openEditLocalRouteModal(routeId) {
  if (!isAdminLoggedIn()) {
    openModal('adminLoginModal');
    return;
  }

  const route = localRoutesData.find(r => r.id === routeId);
  if (!route) return;

  const editId = document.getElementById('localRouteEditId');
  const title = document.getElementById('localRouteModalTitle');
  const origin = document.getElementById('localOriginInput');
  const dest = document.getElementById('localDestinationInput');
  const via = document.getElementById('localViaInput');
  const dep = document.getElementById('localDepartureTimeInput');
  const arr = document.getElementById('localArrivalTimeInput');
  const fare = document.getElementById('localFareInput');
  const busType = document.getElementById('localBusTypeSelect');
  const op = document.getElementById('localOperatorInput');
  const freq = document.getElementById('localFrequencySelect');
  const contact = document.getElementById('localContactInput');
  const status = document.getElementById('localStatusSelect');

  if (editId) editId.value = route.id;
  if (title) title.textContent = 'Alter / Edit Local Route';
  if (origin) origin.value = route.origin || '';
  if (dest) dest.value = route.destination || '';
  if (via) via.value = route.via || '';
  if (dep) dep.value = route.departureTime || '';
  if (arr) arr.value = route.arrivalTime || '';
  if (fare) fare.value = route.fare || '';
  if (busType) busType.value = route.busType || 'HRTC Ordinary';
  if (op) op.value = route.operator || '';
  if (freq) freq.value = route.frequency || 'Daily';
  if (contact) contact.value = route.contact || '';
  if (status) status.value = route.status || 'Active & Running';

  openModal('localRouteModal');
}

function handleLocalRouteSubmit(e) {
  e.preventDefault();
  if (!isAdminLoggedIn()) {
    showToast('error', 'Unauthorized: Only logged in admin can save routes.');
    return;
  }

  const editId = document.getElementById('localRouteEditId').value;
  const origin = document.getElementById('localOriginInput').value.trim();
  const dest = document.getElementById('localDestinationInput').value.trim();
  const via = document.getElementById('localViaInput').value.trim();
  const dep = document.getElementById('localDepartureTimeInput').value.trim();
  const arr = document.getElementById('localArrivalTimeInput').value.trim();
  const fare = document.getElementById('localFareInput').value.trim();
  const busType = document.getElementById('localBusTypeSelect').value;
  const op = document.getElementById('localOperatorInput').value.trim();
  const freq = document.getElementById('localFrequencySelect').value;
  const contact = document.getElementById('localContactInput').value.trim();
  const status = document.getElementById('localStatusSelect').value;

  if (editId) {
    // Update existing route
    const index = localRoutesData.findIndex(r => r.id === editId);
    if (index !== -1) {
      localRoutesData[index] = {
        ...localRoutesData[index],
        origin, destination: dest, via, departureTime: dep,
        arrivalTime: arr, fare: Number(fare), busType,
        operator: op, frequency: freq, contact, status,
        isAltered: true,
        lastAlteredAt: new Date().toLocaleDateString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }),
        updatedAt: new Date().toISOString()
      };
      saveLocalRoutesData();
      showToast('success', `Local route "${origin} to ${dest}" altered successfully.`);
    }
  } else {
    // Create new route
    const newRoute = {
      id: 'local_' + Date.now(),
      origin, destination: dest, via, departureTime: dep,
      arrivalTime: arr, fare: Number(fare), busType,
      operator: op, frequency: freq, contact, status,
      createdAt: new Date().toISOString()
    };
    localRoutesData.unshift(newRoute);
    saveLocalRoutesData();
    showToast('success', `New local route "${origin} to ${dest}" published.`);
  }

  closeModal('localRouteModal');
  renderLocalRoutes();
  updateBadgeCounts();
}

/* ==========================================================================
   CRUD: LONG ROUTED BUSES
   ========================================================================== */
function openAddLongRouteModal() {
  const form = document.getElementById('longRouteForm');
  const editId = document.getElementById('longRouteEditId');
  const title = document.getElementById('longRouteModalTitle');

  if (form) form.reset();
  if (editId) editId.value = '';
  if (title) title.textContent = 'Add Long Routed Bus';

  openModal('longRouteModal');
}

function openEditLongRouteModal(routeId) {
  if (!isAdminLoggedIn()) {
    openModal('adminLoginModal');
    return;
  }

  const route = longRoutesData.find(r => r.id === routeId);
  if (!route) return;

  const editId = document.getElementById('longRouteEditId');
  const title = document.getElementById('longRouteModalTitle');
  const origin = document.getElementById('longOriginInput');
  const dest = document.getElementById('longDestinationInput');
  const via = document.getElementById('longViaInput');
  const dep = document.getElementById('longDepartureTimeInput');
  const arr = document.getElementById('longArrivalTimeInput');
  const dist = document.getElementById('longDistanceInput');
  const busType = document.getElementById('longBusTypeSelect');
  const fare = document.getElementById('longFareInput');
  const op = document.getElementById('longOperatorInput');
  const platform = document.getElementById('longPlatformInput');
  const booking = document.getElementById('longBookingModeSelect');
  const status = document.getElementById('longStatusSelect');
  const amenities = document.getElementById('longAmenitiesInput');

  if (editId) editId.value = route.id;
  if (title) title.textContent = 'Alter / Edit Long Route';
  if (origin) origin.value = route.origin || '';
  if (dest) dest.value = route.destination || '';
  if (via) via.value = route.via || '';
  if (dep) dep.value = route.departureTime || '';
  if (arr) arr.value = route.arrivalTime || '';
  if (dist) dist.value = route.distance || '';
  if (busType) busType.value = route.busType || 'Volvo / Scania Luxury';
  if (fare) fare.value = route.fare || '';
  if (op) op.value = route.operator || '';
  if (platform) platform.value = route.platform || '';
  if (booking) booking.value = route.bookingMode || 'Online (hrtchp.com / RedBus) + Counter';
  if (status) status.value = route.status || 'Active & Running';
  if (amenities) amenities.value = route.amenities || '';

  openModal('longRouteModal');
}

function handleLongRouteSubmit(e) {
  e.preventDefault();
  if (!isAdminLoggedIn()) {
    showToast('error', 'Unauthorized: Only logged in admin can save long routes.');
    return;
  }

  const editId = document.getElementById('longRouteEditId').value;
  const origin = document.getElementById('longOriginInput').value.trim();
  const dest = document.getElementById('longDestinationInput').value.trim();
  const via = document.getElementById('longViaInput').value.trim();
  const dep = document.getElementById('longDepartureTimeInput').value.trim();
  const arr = document.getElementById('longArrivalTimeInput').value.trim();
  const dist = document.getElementById('longDistanceInput').value.trim();
  const busType = document.getElementById('longBusTypeSelect').value;
  const fare = document.getElementById('longFareInput').value.trim();
  const op = document.getElementById('longOperatorInput').value.trim();
  const platform = document.getElementById('longPlatformInput').value.trim();
  const booking = document.getElementById('longBookingModeSelect').value;
  const status = document.getElementById('longStatusSelect') ? document.getElementById('longStatusSelect').value : 'Active & Running';
  const amenities = document.getElementById('longAmenitiesInput').value.trim();

  if (editId) {
    const index = longRoutesData.findIndex(r => r.id === editId);
    if (index !== -1) {
      longRoutesData[index] = {
        ...longRoutesData[index],
        origin, destination: dest, via, departureTime: dep,
        arrivalTime: arr, distance: Number(dist), busType,
        fare: Number(fare), operator: op, platform, bookingMode: booking,
        status, isAltered: true, lastAlteredAt: new Date().toLocaleDateString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }),
        amenities, updatedAt: new Date().toISOString()
      };
      saveLongRoutesData();
      showToast('success', `Long route "${origin} to ${dest}" altered successfully.`);
    }
  } else {
    const newRoute = {
      id: 'long_' + Date.now(),
      origin, destination: dest, via, departureTime: dep,
      arrivalTime: arr, distance: Number(dist), busType,
      fare: Number(fare), operator: op, platform, bookingMode: booking,
      status, isAltered: false,
      amenities, createdAt: new Date().toISOString()
    };
    longRoutesData.unshift(newRoute);
    saveLongRoutesData();
    showToast('success', `New long route "${origin} to ${dest}" published.`);
  }

  closeModal('longRouteModal');
  renderLongRoutes();
  updateBadgeCounts();
}

/* ==========================================================================
   CRUD: DAILY UPDATES BULLETIN
   ========================================================================== */
function openAddDailyUpdateModal() {
  const form = document.getElementById('dailyUpdateForm');
  const editId = document.getElementById('dailyUpdateEditId');
  const title = document.getElementById('dailyUpdateModalTitle');

  if (form) form.reset();
  if (editId) editId.value = '';
  if (title) title.textContent = 'Post Daily Highway & Bus Update';

  openModal('dailyUpdateModal');
}

function openEditDailyUpdateModal(updateId) {
  if (!isAdminLoggedIn()) {
    openModal('adminLoginModal');
    return;
  }

  const update = dailyUpdatesData.find(u => u.id === updateId);
  if (!update) return;

  const editId = document.getElementById('dailyUpdateEditId');
  const title = document.getElementById('dailyUpdateModalTitle');
  const heading = document.getElementById('updateTitleInput');
  const cat = document.getElementById('updateCategorySelect');
  const sev = document.getElementById('updateSeveritySelect');
  const loc = document.getElementById('updateLocationInput');
  const content = document.getElementById('updateContentInput');

  if (editId) editId.value = update.id;
  if (title) title.textContent = 'Alter Daily Highway Update';
  if (heading) heading.value = update.title || '';
  if (cat) cat.value = update.category || 'road';
  if (sev) sev.value = update.severity || 'info';
  if (loc) loc.value = update.location || '';
  if (content) content.value = update.content || '';

  openModal('dailyUpdateModal');
}

function handleDailyUpdateSubmit(e) {
  e.preventDefault();
  if (!isAdminLoggedIn()) {
    showToast('error', 'Unauthorized: Only logged in admin can post updates.');
    return;
  }

  const editId = document.getElementById('dailyUpdateEditId').value;
  const title = document.getElementById('updateTitleInput').value.trim();
  const cat = document.getElementById('updateCategorySelect').value;
  const sev = document.getElementById('updateSeveritySelect').value;
  const loc = document.getElementById('updateLocationInput').value.trim();
  const content = document.getElementById('updateContentInput').value.trim();

  const formattedTime = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  });

  if (editId) {
    const index = dailyUpdatesData.findIndex(u => u.id === editId);
    if (index !== -1) {
      dailyUpdatesData[index] = {
        ...dailyUpdatesData[index],
        title, category: cat, severity: sev,
        location: loc, content,
        timestamp: formattedTime + ' (Edited)',
        updatedAt: new Date().toISOString()
      };
      saveDailyUpdatesData();
      showToast('success', 'Highway announcement altered successfully.');
    }
  } else {
    const newUpdate = {
      id: 'update_' + Date.now(),
      title, category: cat, severity: sev,
      location: loc, content,
      timestamp: formattedTime,
      createdAt: new Date().toISOString()
    };
    dailyUpdatesData.unshift(newUpdate);
    saveDailyUpdatesData();
    showToast('success', 'New highway bulletin published.');
  }

  closeModal('dailyUpdateModal');
  renderDailyUpdates();
  updateBadgeCounts();
}

/* ==========================================================================
   DELETION HANDLERS (LOCAL / LONG / UPDATE)
   ========================================================================== */
function promptDeleteRoute(type, id) {
  if (!isAdminLoggedIn()) {
    showToast('error', 'Unauthorized: Admin login required.');
    return;
  }

  pendingDeleteTarget = { type, id };
  const msg = document.getElementById('deleteModalMessage');

  if (msg) {
    if (type === 'local') {
      const item = localRoutesData.find(r => r.id === id);
      msg.textContent = `Are you sure you want to permanently delete the local route "${item ? item.origin + ' to ' + item.destination : 'this route'}"?`;
    } else if (type === 'long') {
      const item = longRoutesData.find(r => r.id === id);
      msg.textContent = `Are you sure you want to permanently delete the long route "${item ? item.origin + ' to ' + item.destination : 'this route'}"?`;
    } else if (type === 'update') {
      const item = dailyUpdatesData.find(u => u.id === id);
      msg.textContent = `Are you sure you want to delete the announcement "${item ? item.title : 'this update'}"?`;
    }
  }

  openModal('confirmDeleteModal');
}

function executeConfirmedDeletion() {
  if (!pendingDeleteTarget || !isAdminLoggedIn()) {
    closeModal('confirmDeleteModal');
    return;
  }

  const { type, id } = pendingDeleteTarget;

  if (type === 'local') {
    localRoutesData = localRoutesData.filter(r => r.id !== id);
    saveLocalRoutesData();
    renderLocalRoutes();
    showToast('success', 'Local route deleted permanently.');
  } else if (type === 'long') {
    longRoutesData = longRoutesData.filter(r => r.id !== id);
    saveLongRoutesData();
    renderLongRoutes();
    showToast('success', 'Long route deleted permanently.');
  } else if (type === 'update') {
    dailyUpdatesData = dailyUpdatesData.filter(u => u.id !== id);
    saveDailyUpdatesData();
    renderDailyUpdates();
    showToast('success', 'Highway update removed.');
  }

  pendingDeleteTarget = null;
  closeModal('confirmDeleteModal');
  updateBadgeCounts();
}

/* ==========================================================================
   MODAL CONTROLS & UTILITIES
   ========================================================================== */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

function setupModalDismissals() {
  // Bind close buttons
  document.querySelectorAll('.modal-close-btn, .btn-secondary').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) closeModal(modal.id);
    });
  });

  // Click outside to dismiss
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(overlay.id);
      }
    });
  });

  // ESC key to dismiss
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(modal => {
        closeModal(modal.id);
      });
    }
  });
}

/**
 * Toast Notification System
 */
function showToast(type, message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let icon = 'fa-solid fa-circle-info';
  if (type === 'success') icon = 'fa-solid fa-circle-check';
  if (type === 'error') icon = 'fa-solid fa-triangle-exclamation';

  toast.innerHTML = `
    <i class="${icon} toast-icon"></i>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 4000);
}

/**
 * HTML Escaper Utility
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


/* ==========================================================================
   ADMIN SETTINGS & ROUTE ALTERATION HUB
   Comprehensive management console for changing, altering, and deleting routes.
   ========================================================================== */

/**
 * Open Admin Settings Modal
 */
function openAdminSettingsModal(preferredTab = 'routes', preferredFilter = 'all') {
  if (!isAdminLoggedIn()) {
    openModal('adminLoginModal');
    return;
  }

  // Set active tab
  if (preferredTab === 'routes') {
    switchSettingsTab('tabSettingsRoutes');
    if (preferredFilter) {
      adminSettingsFilterType = preferredFilter;
      document.querySelectorAll('[data-settings-filter]').forEach(pill => {
        pill.classList.toggle('active', pill.getAttribute('data-settings-filter') === preferredFilter);
      });
    }
  } else if (preferredTab === 'updates') {
    switchSettingsTab('tabSettingsUpdates');
  } else if (preferredTab === 'backup') {
    switchSettingsTab('tabSettingsBackup');
  }

  renderAdminRoutesTable();
  renderAdminUpdatesTable();
  openModal('adminSettingsModal');
}

/**
 * Switch Settings Tabs
 */
function switchSettingsTab(targetTabId) {
  adminSettingsActiveTab = targetTabId;
  document.querySelectorAll('.settings-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-settings-tab') === targetTabId);
  });
  document.querySelectorAll('.settings-panel-content').forEach(panel => {
    panel.classList.toggle('active', panel.id === targetTabId);
  });
}

/**
 * Render Admin Routes Management Table
 */
function renderAdminRoutesTable() {
  const tbody = document.getElementById('adminRoutesTableBody');
  if (!tbody) return;

  // Combine both local and long routes with unified structure
  const allRoutes = [
    ...localRoutesData.map(r => ({ ...r, routeType: 'local' })),
    ...longRoutesData.map(r => ({ ...r, routeType: 'long' }))
  ];

  // Filter by category pill
  let filtered = allRoutes;
  if (adminSettingsFilterType === 'local') {
    filtered = filtered.filter(r => r.routeType === 'local');
  } else if (adminSettingsFilterType === 'long') {
    filtered = filtered.filter(r => r.routeType === 'long');
  }

  // Filter by search query
  if (adminSettingsRouteQuery) {
    const q = adminSettingsRouteQuery.toLowerCase();
    filtered = filtered.filter(r => 
      (r.origin || '').toLowerCase().includes(q) ||
      (r.destination || '').toLowerCase().includes(q) ||
      (r.via || '').toLowerCase().includes(q) ||
      (r.operator || '').toLowerCase().includes(q) ||
      (r.busType || '').toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="settings-table-empty">
          <div class="table-empty-inner">
            <i class="fa-solid fa-route"></i>
            <p><strong>No routes found in registry.</strong></p>
            <span>${allRoutes.length === 0 ? 'No routes added yet. Use "+ Add Local" or "+ Add Long" to populate.' : 'No routes matched the filter criteria.'}</span>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(route => {
    const isLocal = route.routeType === 'local';
    const typeBadge = isLocal 
      ? '<span class="settings-pill-local"><i class="fa-solid fa-signs-post"></i> Local</span>'
      : '<span class="settings-pill-long"><i class="fa-solid fa-road"></i> Long</span>';

    const currentStatus = route.status || 'Active & Running';

    return `
      <tr class="settings-table-row" data-route-id="${route.id}">
        <td>${typeBadge}</td>
        <td>
          <div class="tbl-route-stations">
            <strong>${escapeHtml(route.origin)}</strong> &rarr; <strong>${escapeHtml(route.destination)}</strong>
          </div>
          <div class="tbl-route-via text-dim">
            <small><i class="fa-solid fa-route text-cyan"></i> Via: ${escapeHtml(route.via || 'Direct')}</small>
          </div>
          ${route.isAltered ? `<span class="tbl-altered-tag"><i class="fa-solid fa-pen-nib"></i> Altered (${escapeHtml(route.lastAlteredAt || 'Recently')})</span>` : ''}
        </td>
        <td>
          <div class="tbl-times">
            <span class="text-cyan"><i class="fa-regular fa-clock"></i> ${escapeHtml(route.departureTime)}</span>
            ${route.arrivalTime ? `<span class="text-dim"> &rarr; ${escapeHtml(route.arrivalTime)}</span>` : ''}
          </div>
          <div class="tbl-fare fare-highlight">₹${escapeHtml(String(route.fare || '0'))}</div>
        </td>
        <td>
          <div class="tbl-bustype">${escapeHtml(route.busType || 'Ordinary')}</div>
          <div class="text-dim"><small>${escapeHtml(route.operator || 'HRTC')}</small></div>
        </td>
        <td>
          <select class="settings-status-select" onchange="quickChangeRouteStatus('${route.routeType}', '${route.id}', this.value)" title="Change Operational Status">
            <option value="Active & Running" ${currentStatus === 'Active & Running' ? 'selected' : ''}>Active & Running</option>
            <option value="Altered / Diverted" ${currentStatus === 'Altered / Diverted' || currentStatus === 'Route Diverted' ? 'selected' : ''}>Altered / Diverted</option>
            <option value="Delayed Departure" ${currentStatus.includes('Delayed') ? 'selected' : ''}>Delayed Departure</option>
            <option value="Subject to Weather" ${currentStatus.includes('Weather') ? 'selected' : ''}>Subject to Weather</option>
            <option value="Road Maintenance" ${currentStatus.includes('Maintenance') ? 'selected' : ''}>Road Maintenance</option>
            <option value="Temporarily Suspended" ${currentStatus.includes('Suspended') ? 'selected' : ''}>Temporarily Suspended</option>
          </select>
        </td>
        <td style="text-align: right;">
          <div class="settings-row-actions">
            <button class="btn-tbl-alter" onclick="triggerAlterRouteFromSettings('${route.routeType}', '${route.id}')" title="Alter Route Details">
              <i class="fa-solid fa-pen-to-square"></i> Alter
            </button>
            <button class="btn-tbl-broadcast" onclick="broadcastRouteAlteration('${route.routeType}', '${route.id}')" title="Broadcast Update Notice">
              <i class="fa-solid fa-bullhorn"></i> Broadcast
            </button>
            <button class="btn-tbl-delete" onclick="promptDeleteRoute('${route.routeType}', '${route.id}')" title="Delete Route">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Render Admin Daily Updates Management Table
 */
function renderAdminUpdatesTable() {
  const tbody = document.getElementById('adminUpdatesTableBody');
  if (!tbody) return;

  let filtered = dailyUpdatesData;
  if (adminSettingsUpdateQuery) {
    const q = adminSettingsUpdateQuery.toLowerCase();
    filtered = filtered.filter(u => 
      (u.title || '').toLowerCase().includes(q) ||
      (u.location || '').toLowerCase().includes(q) ||
      (u.category || '').toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="settings-table-empty">
          <div class="table-empty-inner">
            <i class="fa-solid fa-bullhorn"></i>
            <p><strong>No daily updates registered.</strong></p>
            <span>Click "+ Post New Daily Update" to publish road conditions or timetable revisions.</span>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(item => {
    const severityPill = item.severity === 'alert' 
      ? '<span class="badge-tag-red"><i class="fa-solid fa-triangle-exclamation"></i> Critical Alert</span>'
      : (item.severity === 'normal' 
          ? '<span class="badge-tag-neon"><i class="fa-solid fa-check"></i> Normal Clear</span>'
          : '<span class="badge-tag-cyan"><i class="fa-solid fa-circle-info"></i> Advisory</span>');

    return `
      <tr class="settings-table-row">
        <td>${severityPill}</td>
        <td>
          <div class="tbl-update-headline"><strong>${escapeHtml(item.title)}</strong></div>
          <div class="tbl-update-loc text-dim"><small><i class="fa-solid fa-location-dot"></i> ${escapeHtml(item.location || 'Himachal Pradesh')}</small></div>
        </td>
        <td><span class="update-cat-pill">${escapeHtml((item.category || 'Road').toUpperCase())}</span></td>
        <td><small class="text-dim">${escapeHtml(item.timestamp || 'Today')}</small></td>
        <td style="text-align: right;">
          <div class="settings-row-actions">
            <button class="btn-tbl-alter" onclick="openEditDailyUpdateModal('${item.id}')" title="Alter Announcement">
              <i class="fa-solid fa-pen-to-square"></i> Alter
            </button>
            <button class="btn-tbl-delete" onclick="promptDeleteRoute('update', '${item.id}')" title="Delete Announcement">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Quick change route status directly from Admin Settings table
 */
function quickChangeRouteStatus(type, id, newStatus) {
  if (!isAdminLoggedIn()) {
    showToast('error', 'Admin authorization required.');
    return;
  }

  if (type === 'local') {
    const index = localRoutesData.findIndex(r => r.id === id);
    if (index !== -1) {
      localRoutesData[index].status = newStatus;
      localRoutesData[index].isAltered = true;
      localRoutesData[index].lastAlteredAt = new Date().toLocaleDateString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });
      saveLocalRoutesData();
      renderLocalRoutes();
      showToast('success', `Local route status changed to "${newStatus}".`);
    }
  } else if (type === 'long') {
    const index = longRoutesData.findIndex(r => r.id === id);
    if (index !== -1) {
      longRoutesData[index].status = newStatus;
      longRoutesData[index].isAltered = true;
      longRoutesData[index].lastAlteredAt = new Date().toLocaleDateString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });
      saveLongRoutesData();
      renderLongRoutes();
      showToast('success', `Long route status changed to "${newStatus}".`);
    }
  }

  renderAdminRoutesTable();
}

/**
 * Trigger Alter Route from Admin Settings
 */
function triggerAlterRouteFromSettings(type, id) {
  closeModal('adminSettingsModal');
  if (type === 'local') {
    openEditLocalRouteModal(id);
  } else if (type === 'long') {
    openEditLongRouteModal(id);
  }
}

/**
 * Broadcast Route Alteration into Daily Updates
 * Pre-fills the daily update modal so passengers are immediately notified!
 */
function broadcastRouteAlteration(type, id) {
  if (!isAdminLoggedIn()) {
    openModal('adminLoginModal');
    return;
  }

  let route = null;
  let typeLabel = '';
  if (type === 'local') {
    route = localRoutesData.find(r => r.id === id);
    typeLabel = 'Local Route';
  } else {
    route = longRoutesData.find(r => r.id === id);
    typeLabel = 'Long Route';
  }

  if (!route) return;

  // Open Daily Update Modal
  openAddDailyUpdateModal();

  const titleInput = document.getElementById('updateTitleInput');
  const catSelect = document.getElementById('updateCategorySelect');
  const sevSelect = document.getElementById('updateSeveritySelect');
  const locInput = document.getElementById('updateLocationInput');
  const contentInput = document.getElementById('updateContentInput');

  if (titleInput) titleInput.value = `Route Alteration Notice: ${route.origin} to ${route.destination}`;
  if (catSelect) catSelect.value = 'timetable';
  if (sevSelect) sevSelect.value = (route.status && (route.status.includes('Diverted') || route.status.includes('Suspended'))) ? 'alert' : 'info';
  if (locInput) locInput.value = `${route.origin} - ${route.destination} (via ${route.via || 'Direct'})`;
  if (contentInput) {
    contentInput.value = `Passengers are advised that the ${route.busType || 'bus'} service from ${route.origin} to ${route.destination} (Dep: ${route.departureTime}, Arr: ${route.arrivalTime || '--'}) has a schedule update.\n\nCurrent Status: ${route.status || 'Active & Running'}.\nOperator: ${route.operator || 'HRTC Baijnath'}.\nHelpline / Contact: ${route.contact || '+91 9129300044'}.`;
  }

  showToast('info', 'Pre-filled passenger notice for altered route. Review and click Publish.');
}

/**
 * Export All Routes & Updates to JSON Backup
 */
function exportRoutesJSON() {
  const exportData = {
    portal: 'BUSESOFHP(96)',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    localRoutes: localRoutesData,
    longRoutes: longRoutesData,
    dailyUpdates: dailyUpdatesData
  };

  const jsonStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `busesofhp_routes_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('success', 'Route schedules exported successfully as JSON backup.');
}

/**
 * Import Routes from JSON File
 */
function importRoutesJSON(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data && (Array.isArray(data.localRoutes) || Array.isArray(data.longRoutes))) {
        if (Array.isArray(data.localRoutes)) localRoutesData = data.localRoutes;
        if (Array.isArray(data.longRoutes)) longRoutesData = data.longRoutes;
        if (Array.isArray(data.dailyUpdates)) dailyUpdatesData = data.dailyUpdates;

        saveLocalRoutesData();
        saveLongRoutesData();
        saveDailyUpdatesData();

        renderAllSections();
        renderAdminRoutesTable();
        renderAdminUpdatesTable();

        showToast('success', `Imported successfully: ${localRoutesData.length} local routes, ${longRoutesData.length} long routes.`);
      } else {
        showToast('error', 'Invalid JSON backup format.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to parse JSON file.');
    }
    event.target.value = '';
  };
  reader.readAsText(file);
}

/**
 * Clear All Routes & Updates back to strictly empty
 */
function clearAllRoutesData() {
  if (!confirm('CAUTION: Are you sure you want to clear ALL routes and updates? This will reset the portal back to strictly 0 routes.')) {
    return;
  }

  localRoutesData = [];
  longRoutesData = [];
  dailyUpdatesData = [];

  saveLocalRoutesData();
  saveLongRoutesData();
  saveDailyUpdatesData();

  renderAllSections();
  renderAdminRoutesTable();
  renderAdminUpdatesTable();

  showToast('info', 'All route data cleared. Portal reset to empty state (0 routes).');
}

/**
 * Attach Admin Settings Event Listeners
 */
function setupAdminSettingsListeners() {
  // Settings Trigger Buttons
  const adminBarSettingsBtn = document.getElementById('adminBarSettingsBtn');
  const navAdminSettingsBtn = document.getElementById('navAdminSettingsBtn');
  const openLocalSettingsBtn = document.getElementById('openLocalSettingsBtn');
  const openLongSettingsBtn = document.getElementById('openLongSettingsBtn');
  const openUpdatesSettingsBtn = document.getElementById('openUpdatesSettingsBtn');

  if (adminBarSettingsBtn) adminBarSettingsBtn.addEventListener('click', () => openAdminSettingsModal('routes'));
  if (navAdminSettingsBtn) navAdminSettingsBtn.addEventListener('click', () => openAdminSettingsModal('routes'));
  if (openLocalSettingsBtn) openLocalSettingsBtn.addEventListener('click', () => openAdminSettingsModal('routes', 'local'));
  if (openLongSettingsBtn) openLongSettingsBtn.addEventListener('click', () => openAdminSettingsModal('routes', 'long'));
  if (openUpdatesSettingsBtn) openUpdatesSettingsBtn.addEventListener('click', () => openAdminSettingsModal('updates'));

  // Settings Tabs
  document.querySelectorAll('.settings-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-settings-tab');
      switchSettingsTab(target);
    });
  });

  // Settings Filter Pills
  document.querySelectorAll('[data-settings-filter]').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('[data-settings-filter]').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      adminSettingsFilterType = pill.getAttribute('data-settings-filter');
      renderAdminRoutesTable();
    });
  });

  // Settings Route Search
  const adminSettingsRouteSearch = document.getElementById('adminSettingsRouteSearch');
  if (adminSettingsRouteSearch) {
    adminSettingsRouteSearch.addEventListener('input', (e) => {
      adminSettingsRouteQuery = e.target.value.trim();
      renderAdminRoutesTable();
    });
  }

  // Settings Updates Search
  const adminSettingsUpdateSearch = document.getElementById('adminSettingsUpdateSearch');
  if (adminSettingsUpdateSearch) {
    adminSettingsUpdateSearch.addEventListener('input', (e) => {
      adminSettingsUpdateQuery = e.target.value.trim();
      renderAdminUpdatesTable();
    });
  }

  // Settings Quick Add Buttons
  const settingsAddLocalBtn = document.getElementById('settingsAddLocalBtn');
  const settingsAddLongBtn = document.getElementById('settingsAddLongBtn');
  const settingsAddUpdateBtn = document.getElementById('settingsAddUpdateBtn');

  if (settingsAddLocalBtn) settingsAddLocalBtn.addEventListener('click', () => {
    closeModal('adminSettingsModal');
    openAddLocalRouteModal();
  });
  if (settingsAddLongBtn) settingsAddLongBtn.addEventListener('click', () => {
    closeModal('adminSettingsModal');
    openAddLongRouteModal();
  });
  if (settingsAddUpdateBtn) settingsAddUpdateBtn.addEventListener('click', () => {
    closeModal('adminSettingsModal');
    openAddDailyUpdateModal();
  });

  // Backup & Import
  const exportRoutesJsonBtn = document.getElementById('exportRoutesJsonBtn');
  const importRoutesJsonInput = document.getElementById('importRoutesJsonInput');
  const clearAllRoutesBtn = document.getElementById('clearAllRoutesBtn');

  if (exportRoutesJsonBtn) exportRoutesJsonBtn.addEventListener('click', exportRoutesJSON);
  if (importRoutesJsonInput) importRoutesJsonInput.addEventListener('change', importRoutesJSON);
  if (clearAllRoutesBtn) clearAllRoutesBtn.addEventListener('click', clearAllRoutesData);

  // Close Settings Buttons
  const closeAdminSettingsModalBtn = document.getElementById('closeAdminSettingsModalBtn');
  const closeAdminSettingsFooterBtn = document.getElementById('closeAdminSettingsFooterBtn');
  if (closeAdminSettingsModalBtn) closeAdminSettingsModalBtn.addEventListener('click', () => closeModal('adminSettingsModal'));
  if (closeAdminSettingsFooterBtn) closeAdminSettingsFooterBtn.addEventListener('click', () => closeModal('adminSettingsModal'));
}

