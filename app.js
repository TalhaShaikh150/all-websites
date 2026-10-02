/**
 * TALHA — MINIMAL PORTFOLIO ENGINE
 * Clean black & white showcase with responsive 16:10 scaled iframe previews.
 */

document.addEventListener('DOMContentLoaded', () => {
  // State
  let currentCategory = 'all';
  let searchQuery = '';

  // DOM Elements
  const gridContainer = document.getElementById('projects-grid');
  const emptyState = document.getElementById('empty-state');
  const categoryNav = document.getElementById('category-nav');
  const searchInput = document.getElementById('search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const btnReset = document.getElementById('btn-reset');

  // Modal Elements
  const modal = document.getElementById('quick-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalIframe = document.getElementById('modal-iframe');
  const modalVisitLink = document.getElementById('modal-visit-link');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  // ==========================================
  // 1. Render Category Filters
  // ==========================================
  function renderCategories() {
    categoryNav.innerHTML = '';

    CATEGORIES.forEach(cat => {
      const count = cat.id === 'all'
        ? PROJECTS_DATA.length
        : PROJECTS_DATA.filter(p => p.category === cat.id).length;

      const btn = document.createElement('button');
      btn.className = `category-btn ${cat.id === currentCategory ? 'active' : ''}`;
      btn.setAttribute('data-category', cat.id);
      btn.innerHTML = `
        <span>${cat.label}</span>
        <span class="category-count">(${count})</span>
      `;

      btn.addEventListener('click', () => {
        currentCategory = cat.id;
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyFilters();
      });

      categoryNav.appendChild(btn);
    });
  }

  // ==========================================
  // 2. Proportional Scaling for Iframe Previews
  // ==========================================
  const scalerMap = new Map();

  function updateScaler(viewport, scaler) {
    if (!viewport || !scaler) return;
    const containerWidth = viewport.getBoundingClientRect().width || viewport.offsetWidth;
    if (containerWidth > 0) {
      const scale = containerWidth / 1280;
      scaler.style.transform = `scale(${scale})`;
    }
  }

  const resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
      const scaler = scalerMap.get(entry.target);
      if (scaler) {
        const width = entry.contentRect.width || entry.target.offsetWidth;
        if (width > 0) {
          scaler.style.transform = `scale(${width / 1280})`;
        }
      }
    }
  });

  // ==========================================
  // 3. Create Project Card
  // ==========================================
  function createCardElement(project, index) {
    const card = document.createElement('article');
    card.className = 'project-card';
    card.id = `card-${project.id}`;

    const formattedIndex = String(index + 1).padStart(2, '0');
    const displayDomain = project.url.replace(/^https?:\/\//, '').replace(/\/$/, '');

    card.innerHTML = `
      <!-- Card Top Bar -->
      <div class="card-header-bar">
        <span class="card-index">${formattedIndex} / ${String(PROJECTS_DATA.length).padStart(2, '0')}</span>
        <span class="card-category-name">${project.categoryLabel}</span>
        <a href="${project.url}" target="_blank" rel="noopener noreferrer" class="card-external-arrow" title="Open live site">
          <span>${displayDomain}</span> ↗
        </a>
      </div>

      <!-- Preview Viewport (Scaled 1280x800 iframe) -->
      <div class="card-preview-viewport">
        <div class="card-preview-skeleton" id="skeleton-${project.id}">
          <div class="skeleton-spinner"></div>
          <span class="skeleton-label">Loading preview...</span>
        </div>

        <div class="card-iframe-scaler">
          <iframe 
            class="card-iframe" 
            data-src="${project.url}" 
            title="${project.title} live preview" 
            loading="lazy"
            tabindex="-1"
          ></iframe>
        </div>

        <!-- Clean Click Overlay -->
        <a href="${project.url}" target="_blank" rel="noopener noreferrer" class="card-preview-overlay">
          <div class="preview-pill">
            <span>View Website</span> ↗
          </div>
        </a>
      </div>

      <!-- Card Details -->
      <div class="card-body">
        <div class="card-title-row">
          <h2 class="card-title">
            <a href="${project.url}" target="_blank" rel="noopener noreferrer">${project.title}</a>
          </h2>
        </div>

        <p class="card-tagline">${project.tagline}</p>

        <div class="card-tags">
          ${project.tags.map(t => `<span class="tag-item">${t}</span>`).join('')}
        </div>

        <div class="card-actions-row">
          <div class="card-left-actions">
            <a href="${project.url}" target="_blank" rel="noopener noreferrer" class="btn-open-site">
              Open Site ↗
            </a>
            ${project.instagram ? `
              <a href="${project.instagram}" target="_blank" rel="noopener noreferrer" class="btn-instagram-link" title="Instagram: ${project.instagramHandle || '@staymadclean'}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                <span>${project.instagramHandle || 'Instagram'}</span>
              </a>
            ` : ''}
          </div>
          <button class="btn-interact-toggle" title="Enable direct mouse interaction inside this card">
            Interact
          </button>
        </div>
      </div>
    `;

    // Hook up scaling observer
    const viewport = card.querySelector('.card-preview-viewport');
    const scaler = card.querySelector('.card-iframe-scaler');
    scalerMap.set(viewport, scaler);
    resizeObserver.observe(viewport);
    updateScaler(viewport, scaler);

    // Setup iframe loading & skeleton dismiss
    const iframe = card.querySelector('.card-iframe');
    const skeleton = card.querySelector('.card-preview-skeleton');

    let dismissed = false;
    const dismissSkeleton = () => {
      if (!dismissed) {
        dismissed = true;
        skeleton.classList.add('loaded');
      }
    };

    iframe.addEventListener('load', () => {
      if (iframe.src && iframe.src !== 'about:blank') {
        dismissSkeleton();
      }
    });

    // Fallback timer so skeleton never stays stuck
    setTimeout(() => {
      if (iframe.src && iframe.src !== 'about:blank') {
        dismissSkeleton();
      }
    }, 4000);

    // Interactive toggle (allows live clicking/scrolling inside the card)
    const overlay = card.querySelector('.card-preview-overlay');
    const interactBtn = card.querySelector('.btn-interact-toggle');

    interactBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = interactBtn.classList.toggle('active');
      if (isActive) {
        overlay.style.pointerEvents = 'none';
        scaler.style.pointerEvents = 'auto';
        interactBtn.textContent = 'Active (Click to lock)';
      } else {
        overlay.style.pointerEvents = 'auto';
        scaler.style.pointerEvents = 'none';
        interactBtn.textContent = 'Interact';
      }
    });

    return card;
  }

  // ==========================================
  // 4. Lazy Loading Observer
  // ==========================================
  let iframeObserver;

  function initObserver() {
    if ('IntersectionObserver' in window) {
      iframeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const iframe = entry.target;
            const src = iframe.getAttribute('data-src');
            if (src && (!iframe.src || iframe.src === 'about:blank')) {
              iframe.src = src;
            }
            observer.unobserve(iframe);
          }
        });
      }, {
        rootMargin: '300px 0px',
        threshold: 0.01
      });
    } else {
      document.querySelectorAll('.card-iframe').forEach(iframe => {
        iframe.src = iframe.getAttribute('data-src');
      });
    }
  }

  function observeIframes() {
    if (!iframeObserver) return;
    document.querySelectorAll('.card-iframe').forEach(iframe => {
      if (!iframe.src || iframe.src === 'about:blank') {
        iframeObserver.observe(iframe);
      }
    });
  }

  // ==========================================
  // 5. Filter & Search
  // ==========================================
  function applyFilters() {
    const query = searchQuery.trim().toLowerCase();

    const filtered = PROJECTS_DATA.filter(project => {
      const matchCat = (currentCategory === 'all' || project.category === currentCategory);
      if (!matchCat) return false;

      if (!query) return true;

      const text = [
        project.title,
        project.tagline,
        project.description,
        project.categoryLabel,
        project.instagramHandle || '',
        ...project.tags,
        project.url
      ].join(' ').toLowerCase();

      return text.includes(query);
    });

    gridContainer.innerHTML = '';

    if (filtered.length === 0) {
      emptyState.classList.add('visible');
    } else {
      emptyState.classList.remove('visible');
      filtered.forEach((project, index) => {
        const card = createCardElement(project, index);
        gridContainer.appendChild(card);

        // Preload first 4 immediately
        if (index < 4) {
          const iframe = card.querySelector('.card-iframe');
          if (iframe && (!iframe.src || iframe.src === 'about:blank')) {
            iframe.src = iframe.getAttribute('data-src');
          }
        }
      });
      observeIframes();
    }
  }

  // ==========================================
  // 6. Search Bar Events
  // ==========================================
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    searchClearBtn.style.display = searchQuery ? 'block' : 'none';
    applyFilters();
  });

  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    searchClearBtn.style.display = 'none';
    searchInput.focus();
    applyFilters();
  });

  btnReset.addEventListener('click', () => {
    currentCategory = 'all';
    searchQuery = '';
    searchInput.value = '';
    searchClearBtn.style.display = 'none';
    renderCategories();
    applyFilters();
  });

  // Modal events
  modalCloseBtn.addEventListener('click', () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    modalIframe.src = 'about:blank';
    document.body.style.overflow = '';
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modalCloseBtn.click();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      modalCloseBtn.click();
    }
    if ((e.key === '/' || (e.ctrlKey && e.key.toLowerCase() === 'k')) && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
  });

  // ==========================================
  // Init
  // ==========================================
  renderCategories();
  initObserver();
  applyFilters();
});
