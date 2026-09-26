const ADMIN_EMAIL = 'admin@tljoyeria.com';
const CAT_LABELS = { cadena: 'Cadena', manilla: 'Manilla', anillo: 'Anillo', aretes: 'Aretes' };

function loadJSON(key, fallback) {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved && Array.isArray(saved) && saved.length) return saved;
  } catch (e) {}
  return fallback;
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
}

function formatCOP(value) {
  return '$' + Number(value || 0).toLocaleString('es-CO');
}

function getProducts() {
  const saved = loadJSON('tl_products', null);
  if (saved) return saved;
  const defaultProducts = [
    { id: 'c1', name: 'Cadena cubana plata', cat: 'cadena', price: 85000, desc: 'Cadena estilo cubano con baño de plata.', material: 'Baño de plata 925', size: '50 cm', finish: 'Brillante pulido', features: ['Cierre reforzado', 'Uso diario', 'Estilo clásico'] },
    { id: 'm1', name: 'Manilla ajustable dorada', cat: 'manilla', price: 35000, desc: 'Manilla ajustable con dije central.', material: 'Baño de oro', size: 'Ajustable', finish: 'Brillante', features: ['Cierre deslizante', 'Ideal para regalo', 'Diseño versátil'] },
    { id: 'a1', name: 'Anillo banda simple', cat: 'anillo', price: 30000, desc: 'Banda lisa minimalista para uso diario.', material: 'Acero quirúrgico', size: '6, 7, 8', finish: 'Brillante', features: ['Hipoalergénico', 'Ligero', 'Minimalista'] },
    { id: 'r2', name: 'Aretes colgantes perla', cat: 'aretes', price: 42000, desc: 'Aretes colgantes con perla sintética.', material: 'Acero + perla sintética', size: '4 cm de largo', finish: 'Pulido', features: ['Elegantes', 'Uso diario o eventos', 'Diseño colgante'] }
  ];
  saveJSON('tl_products', defaultProducts);
  return defaultProducts;
}

function saveProducts(products) {
  saveJSON('tl_products', products);
}

function loadOrders() {
  const saved = loadJSON('tl_admin_orders', null);
  if (saved) return saved;
  const defaultOrders = [
    { id: 'PED-1042', client: 'María P.', total: 85000, status: 'En preparación', item: 'Cadena cubana plata', completed: false },
    { id: 'PED-1041', client: 'Daniel R.', total: 65000, status: 'Pendiente', item: 'Cadena fina dorada', completed: false },
    { id: 'PED-1040', client: 'Sofía L.', total: 35000, status: 'Enviado', item: 'Manilla ajustable dorada', completed: false },
    { id: 'PED-1039', client: 'Camila V.', total: 42000, status: 'Completado', item: 'Aretes colgantes perla', completed: true }
  ];
  saveJSON('tl_admin_orders', defaultOrders);
  return defaultOrders;
}

function saveOrders(orders) {
  saveJSON('tl_admin_orders', orders);
}

function loadUsers() {
  const saved = loadJSON('tl_users', null);
  if (saved) return saved;
  const defaultUsers = {
    'admin@tljoyeria.com': { name: 'Jacob Torres', password: '123' },
    'maria@email.com': { name: 'María P.', password: '123' },
    'daniel@email.com': { name: 'Daniel R.', password: '123' },
    'sofia@email.com': { name: 'Sofía L.', password: '123' }
  };
  saveJSON('tl_users', defaultUsers);
  return defaultUsers;
}

function loadAboutText() {
  const saved = localStorage.getItem('tl_about_text');
  if (saved && saved.trim()) return saved;
  return 'TL Joyería nació con una idea simple: piezas de calidad, a precios justos y con estilo. Cada pieza se selecciona pensando en el uso diario, en la elegancia y en que cada compra se sienta cómoda y memorable.';
}

function saveAboutText(text) {
  localStorage.setItem('tl_about_text', text);
}

function setAdminSection(section) {
  document.querySelectorAll('.admin-nav-item').forEach((button) => {
    const isActive = button.dataset.section === section;
    button.classList.toggle('active', isActive);
  });

  document.querySelectorAll('.admin-section').forEach((panel) => {
    const isActive = panel.dataset.sectionTarget === section;
    panel.classList.toggle('active', isActive);
  });
}

function renderDashboard() {
  const products = getProducts();
  const orders = loadOrders();
  const users = Object.entries(loadUsers());

  const completedRevenue = orders.reduce((sum, order) => {
    const isCompleted = Boolean(order.completed || order.status === 'Completado');
    return sum + (isCompleted ? Number(order.total || 0) : 0);
  }, 0);

  const pending = orders.filter((order) => !(order.completed || order.status === 'Completado')).length;

  const revenueEl = document.getElementById('adminMetricRevenue');
  const productsEl = document.getElementById('adminMetricProducts');
  const ordersEl = document.getElementById('adminMetricOrders');
  const pendingEl = document.getElementById('adminMetricPending');

  if (productsEl) productsEl.textContent = String(products.length);
  if (ordersEl) ordersEl.textContent = String(orders.length);
  if (pendingEl) pendingEl.textContent = String(pending);
  if (revenueEl) revenueEl.textContent = formatCOP(completedRevenue);

  const ordersList = document.getElementById('adminOrdersList');
  if (ordersList) {
    ordersList.innerHTML = orders.map((order) => {
      const done = Boolean(order.completed || order.status === 'Completado');
      const statusOptions = ['Pendiente', 'Confirmado', 'En preparación', 'Enviado', 'Completado'];
      const selectOptions = statusOptions.map((status) =>
        `<option value="${status}" ${status === order.status ? 'selected' : ''}>${status}</option>`
      ).join('');

      return `
        <div class="order-row">
          <div>
            <strong>${order.id}</strong>
            <small>${order.client} · ${order.item}</small>
          </div>
          <div>
            <strong>${formatCOP(order.total)}</strong>
            <small>${done ? 'Cobrado' : 'Sin cobrar'}</small>
          </div>
          <select data-order-status="${order.id}">${selectOptions}</select>
          <button type="button" class="order-toggle ${done ? 'done' : ''}" data-order-toggle="${order.id}">
            ${done ? 'Venta completada' : 'Marcar venta completa'}
          </button>
        </div>
      `;
    }).join('');

    ordersList.querySelectorAll('[data-order-status]').forEach((select) => {
      select.addEventListener('change', (event) => {
        const id = event.target.dataset.orderStatus;
        const nextOrders = loadOrders();
        const entry = nextOrders.find((order) => order.id === id);
        if (!entry) return;
        entry.status = event.target.value;
        entry.completed = event.target.value === 'Completado';
        saveOrders(nextOrders.map((order) => (order.id === id ? entry : order)));
        renderDashboard();
      });
    });

    ordersList.querySelectorAll('[data-order-toggle]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = button.dataset.orderToggle;
        const nextOrders = loadOrders();
        const entry = nextOrders.find((order) => order.id === id);
        if (!entry) return;
        entry.completed = !entry.completed;
        entry.status = entry.completed ? 'Completado' : 'Pendiente';
        saveOrders(nextOrders.map((order) => (order.id === id ? entry : order)));
        renderDashboard();
      });
    });
  }

  const categoriesList = document.getElementById('adminCategoriesList');
  if (categoriesList) {
    const categories = ['cadena', 'manilla', 'anillo', 'aretes'];
    categoriesList.innerHTML = categories.map((cat) => {
      const count = products.filter((product) => product.cat === cat).length;
      return `
        <div class="mini-item">
          <div class="meta">
            <span class="dot"></span>
            <div>
              <strong>${CAT_LABELS[cat] || cat}</strong>
              <small>${count} productos</small>
            </div>
          </div>
          <strong>${count}</strong>
        </div>
      `;
    }).join('');
  }

  const usersList = document.getElementById('adminUsersList');
  if (usersList) {
    usersList.innerHTML = users.map(([email, user]) => `
      <div class="mini-item">
        <div class="meta">
          <span class="dot"></span>
          <div>
            <strong>${user.name}</strong>
            <small>${email}</small>
          </div>
        </div>
        <strong>${email === ADMIN_EMAIL ? 'Propietario' : 'Cliente'}</strong>
      </div>
    `).join('');
  }

  const aboutEditor = document.getElementById('adminAboutText');
  if (aboutEditor) {
    aboutEditor.value = loadAboutText();
  }

  const productsTable = document.getElementById('adminProductsList');
  if (productsTable) {
    productsTable.innerHTML = products.map((product) => `
      <div class="admin-product-item">
        <div>
          <strong>${product.name}</strong>
          <span>${CAT_LABELS[product.cat] || product.cat} · ${formatCOP(product.price)}</span>
        </div>
        <div class="product-actions">
          <button type="button" data-edit="${product.id}">Editar</button>
          <button type="button" class="delete" data-delete="${product.id}">Eliminar</button>
        </div>
      </div>
    `).join('');

    productsTable.querySelectorAll('[data-edit]').forEach((button) => {
      button.addEventListener('click', () => fillProductForm(button.dataset.edit));
    });

    productsTable.querySelectorAll('[data-delete]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = button.dataset.delete;
        const nextProducts = products.filter((product) => product.id !== id);
        saveProducts(nextProducts);
        renderDashboard();
      });
    });
  }
}

function fillProductForm(id) {
  const product = getProducts().find((item) => item.id === id);
  if (!product) return;
  document.getElementById('adminProductId').value = product.id;
  document.getElementById('adminProductName').value = product.name;
  document.getElementById('adminProductCat').value = product.cat;
  document.getElementById('adminProductPrice').value = product.price;
  document.getElementById('adminProductDesc').value = product.desc || '';
}

function resetProductForm() {
  document.getElementById('adminProductForm').reset();
  document.getElementById('adminProductId').value = '';
}

function bindProductForm() {
  const form = document.getElementById('adminProductForm');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const id = document.getElementById('adminProductId').value;
    const name = document.getElementById('adminProductName').value.trim();
    const cat = document.getElementById('adminProductCat').value;
    const price = Number(document.getElementById('adminProductPrice').value) || 0;
    const desc = document.getElementById('adminProductDesc').value.trim();

    if (!name || !price) return;

    const nextProducts = getProducts();
    if (id) {
      const index = nextProducts.findIndex((product) => product.id === id);
      if (index >= 0) {
        nextProducts[index] = { ...nextProducts[index], name, cat, price, desc };
      }
    } else {
      nextProducts.push({
        id: `p${Date.now()}`,
        name,
        cat,
        price,
        desc,
        material: 'Por definir',
        size: 'Por definir',
        finish: 'Por definir',
        features: ['Disponible en stock', 'Piezas de diseño moderno']
      });
    }

    saveProducts(nextProducts);
    resetProductForm();
    renderDashboard();
  });
}

function bindAdminNavigation() {
  document.querySelectorAll('.admin-nav-item').forEach((button) => {
    button.addEventListener('click', () => setAdminSection(button.dataset.section));
  });
}

function ensureAdminAccess() {
  const sessionEmail = localStorage.getItem('tl_session');
  if (sessionEmail !== ADMIN_EMAIL) {
    window.location.href = 'index.html';
  }
}

function initializeAdminPage() {
  ensureAdminAccess();
  bindAdminNavigation();
  bindProductForm();

  document.getElementById('newProductBtn').addEventListener('click', resetProductForm);
  document.getElementById('cancelProductBtn').addEventListener('click', resetProductForm);
  document.getElementById('saveAboutBtn').addEventListener('click', () => {
    const text = document.getElementById('adminAboutText').value.trim();
    if (!text) return;
    saveAboutText(text);
    alert('Se actualizó la sección “Nosotros”.');
  });

  document.getElementById('backToStoreBtn').addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  document.getElementById('adminLogoutBtn').addEventListener('click', () => {
    localStorage.removeItem('tl_session');
    window.location.href = 'index.html';
  });

  setAdminSection('resumen');
  renderDashboard();
}

window.addEventListener('DOMContentLoaded', initializeAdminPage);
