const CATEGORIES = [
  { id: 'health', label: 'Health', color: '#3B6D11', bg: '#EAF3DE' },
  { id: 'career', label: 'Career', color: '#185FA5', bg: '#E6F1FB' },
  { id: 'travel', label: 'Travel', color: '#0F6E56', bg: '#E1F5EE' },
  { id: 'finance', label: 'Finance', color: '#BA7517', bg: '#FAEEDA' },
  { id: 'mindset', label: 'Mindset', color: '#534AB7', bg: '#EEEDFE' },
  { id: 'creative', label: 'Creative', color: '#993556', bg: '#FBEAF0' }
];

const INITIAL_SAMPLES = [
  {
    id: 1,
    cat: 'travel',
    emoji: '🏔️',
    goal: 'Explore the Mountains',
    note: 'Plan a trekking escape to focus on perspective and clear thinking.',
    imgSrc: 'assets/images/mountain.jpg'
  },
  {
    id: 2,
    cat: 'mindset',
    emoji: '🌿',
    goal: 'Connect with Nature',
    note: 'Unplug every single Sunday morning. Walk without devices.',
    imgSrc: 'assets/images/nature.jpg'
  },
  {
    id: 3,
    cat: 'health',
    emoji: '🌸',
    goal: 'Fresh Start this Spring',
    note: 'Introduce raw color palettes into clean eating and daily habit tracking.',
    imgSrc: 'assets/images/spring.jpg'
  }
];

let cards = [];
let activeTab = 'all';

function init() {
  const savedData = localStorage.getItem('visionboard_data');
  if (savedData) {
    cards = JSON.parse(savedData);
  } else {
    cards = [...INITIAL_SAMPLES];
    saveToStorage();
  }
  renderTabs();
  renderGrid();
}

function saveToStorage() {
  localStorage.setItem('visionboard_data', JSON.stringify(cards));
}

function renderTabs() {
  const tabsContainer = document.getElementById('tabs');
  const items = [{ id: 'all', label: '✨ All Goals' }, ...CATEGORIES];
  
  tabsContainer.innerHTML = items.map(t => `
    <button class="tab ${activeTab === t.id ? 'active' : ''}" onclick="setTab('${t.id}')">
      ${t.label}
    </button>
  `).join('');
}

function setTab(categoryId) {
  activeTab = categoryId;
  renderTabs();
  renderGrid();
}

function renderGrid() {
  const grid = document.getElementById('grid');
  const filteredCards = activeTab === 'all' ? cards : cards.filter(c => c.cat === activeTab);
  
  if (filteredCards.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--muted); padding: 3rem 0;">No pinned elements found under this tab view. Click "+ Add Goal" to inject inspiration.</div>`;
    updateCounter(0);
    return;
  }

  grid.innerHTML = filteredCards.map(card => {
    const categoryProfile = CATEGORIES.find(c => c.id === card.cat) || CATEGORIES[0];
    
    const targetThumbnailHTML = card.imgSrc 
      ? `<img src="${card.imgSrc}" alt="${escapeHtml(card.goal)}" onerror="this.style.display='none'; this.parentElement.innerHTML='${card.emoji}'" />`
      : card.emoji;

    return `
      <article class="card">
        <div class="card-thumb" style="background-color: ${categoryProfile.bg}">
          ${targetThumbnailHTML}
        </div>
        <button class="pin-remove" onclick="deleteCard(${card.id})" title="Unpin goal">×</button>
        <div class="card-body">
          <span class="card-category" style="color: ${categoryProfile.color}">${categoryProfile.label}</span>
          <h3 class="card-goal">${escapeHtml(card.goal)}</h3>
          <p class="card-note">${escapeHtml(card.note || '')}</p>
        </div>
      </article>
    `;
  }).join('');

  updateCounter(cards.length);
}

function updateCounter(total) {
  const counter = document.getElementById('card-count');
  counter.textContent = `${total} goal${total !== 1 ? 's' : ''} pinned`;
}

function openModal() {
  const modalRoot = document.getElementById('modal-root');
  modalRoot.innerHTML = `
    <div class="modal-backdrop" id="backdrop">
      <div class="modal">
        <h2 style="margin-bottom: 1.5rem; font-size: 1.25rem; font-weight: 600;">Pin a New Blueprint</h2>
        
        <div class="form-group">
          <label for="f-cat">Focus Target</label>
          <select id="f-cat">
            ${CATEGORIES.map(c => `<option value="${c.id}">${c.label}</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label for="f-emoji">Visual Icon Token</label>
          <select id="f-emoji">
            <option value="🎯">🎯 Target/Milestone</option>
            <option value="🚀">🚀 Launch/Growth</option>
            <option value="✈️">✈️ Travel/Adventure</option>
            <option value="💪">💪 Health/Vitality</option>
            <option value="🌿">🌿 Mindset/Clarity</option>
            <option value="🎨">🎨 Creative Output</option>
            <option value="💵">💵 Financial Target</option>
          </select>
        </div>

        <div class="form-group">
          <label for="f-goal">Core Definition</label>
          <input id="f-goal" type="text" placeholder="e.g., Secure cloud developer track position" required />
        </div>

        <div class="form-group">
          <label for="f-note">Tactical Subnotes</label>
          <textarea id="f-note" placeholder="What key metrics validate tracking this path? Why does this drive you?"></textarea>
        </div>

        <div class="form-group">
          <label for="f-img">File Attachment Upload (Overrides Icon Placement)</label>
          <input id="f-img" type="file" accept="image/*" style="font-size: 0.8rem; background: none; border: none; padding: 0;" />
        </div>

        <div class="modal-actions">
          <button class="btn secondary" onclick="closeModal()">Drop changes</button>
          <button class="btn primary" onclick="saveCard()">Pin Blueprint</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('backdrop').addEventListener('click', (e) => {
    if (e.target.id === 'backdrop') closeModal();
  });
}

function closeModal() {
  document.getElementById('modal-root').innerHTML = '';
}

function saveCard() {
  const goalTitle = document.getElementById('f-goal').value.trim();
  if (!goalTitle) {
    alert('Please outline a definitive target description goal title.');
    return;
  }

  const selectedCategory = document.getElementById('f-cat').value;
  const selectedEmoji = document.getElementById('f-emoji').value;
  const typedNotes = document.getElementById('f-note').value.trim();
  const fileSelector = document.getElementById('f-img').files[0];

  const pushRecord = (computedImageSrc = '') => {
    cards.push({
      id: Date.now(), 
      cat: selectedCategory,
      emoji: selectedEmoji,
      goal: goalTitle,
      note: typedNotes,
      imgSrc: computedImageSrc
    });
    
    saveToStorage();
    closeModal();
    renderGrid();
  };

  if (fileSelector) {
    const fileStreamReader = new FileReader();
    fileStreamReader.onload = (event) => pushRecord(event.target.result);
    fileStreamReader.readAsDataURL(fileSelector);
  } else {
    pushRecord();
  }
}

function deleteCard(targetId) {
  if (confirm("Are you sure you want to remove this pinned goal element from your workspace configuration?")) {
    cards = cards.filter(c => c.id !== targetId);
    saveToStorage();
    renderGrid();
  }
}

function escapeHtml(string) {
  const mapping = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' };
  return String(string).replace(/[&<>"']/g, match => mapping[match]);
}

document.getElementById('add-btn').addEventListener('click', openModal);
window.addEventListener('DOMContentLoaded', init);