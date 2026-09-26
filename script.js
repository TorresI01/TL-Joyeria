/* ======================================================
   TL Joyería — script.js
   Sitio de una sola página: catálogo, carrito, cuenta,
   panel de administración y modal de producto.
   Todo funciona en el navegador (localStorage), sin backend.
====================================================== */

/* ---------- Datos base de productos ---------- */
var DEFAULT_PRODUCTS = [
  {id:'c1', name:'Cadena cubana plata', cat:'cadena', price:85000,
    desc:'Cadena estilo cubano con baño de plata, ideal para uso diario o combinar con dijes.',
    material:'Baño de plata 925', size:'50 cm', finish:'Brillante pulido',
    features:['Cierre de mosquetón reforzado','Resistente al uso diario','Combina con cualquier look']},
  {id:'c2', name:'Cadena fina oro laminado', cat:'cadena', price:65000,
    desc:'Cadena delgada en oro laminado, perfecta para un estilo discreto y elegante.',
    material:'Oro laminado 18k', size:'45 cm', finish:'Satinado',
    features:['Ligera y cómoda','No se oxida con el uso normal','Ideal para looks minimalistas']},
  {id:'c3', name:'Cadena choker acero', cat:'cadena', price:45000,
    desc:'Cadena corta tipo choker en acero inoxidable, un básico moderno.',
    material:'Acero inoxidable', size:'38 cm', finish:'Mate',
    features:['Hipoalergénica','Resistente a la humedad','Estilo urbano']},
  {id:'m1', name:'Manilla ajustable dorada', cat:'manilla', price:35000,
    desc:'Manilla de cordón ajustable con dije central, se adapta a cualquier muñeca.',
    material:'Baño de oro', size:'Ajustable', finish:'Brillante',
    features:['Cierre deslizante ajustable','Dije central incluido','Ideal para regalo']},
  {id:'m2', name:'Manilla dije corazón', cat:'manilla', price:40000,
    desc:'Cadena fina con dije de corazón, un clásico romántico y delicado.',
    material:'Acero dorado', size:'16-19 cm', finish:'Pulido',
    features:['Dije de corazón macizo','Cierre de mosquetón','Combina con set de aretes']},
  {id:'m3', name:'Set manillas x3', cat:'manilla', price:55000,
    desc:'Combinado de tres manillas de distintos estilos para armar tu propio stack.',
    material:'Combinado (acero y cordón)', size:'Ajustable', finish:'Variado',
    features:['Tres piezas en un solo set','Se pueden usar juntas o por separado','Excelente relación precio-cantidad']},
  {id:'a1', name:'Anillo banda simple', cat:'anillo', price:30000,
    desc:'Banda lisa minimalista, perfecta para uso diario o combinar en varios dedos.',
    material:'Acero quirúrgico', size:'6, 7, 8', finish:'Brillante',
    features:['No se opaca con el agua','Disponible en varias tallas','Diseño atemporal']},
  {id:'a2', name:'Anillo con piedra', cat:'anillo', price:48000,
    desc:'Diseño sobrio con piedra central, un detalle luminoso para cualquier ocasión.',
    material:'Baño de plata + circonia', size:'6, 7, 8', finish:'Pulido',
    features:['Piedra central engastada','Acabado hipoalergénico','Ideal para regalo']},
  {id:'a3', name:'Set ajustable talla libre', cat:'anillo', price:38000,
    desc:'Dos anillos ajustables en un mismo set, talla libre para cualquier persona.',
    material:'Acero dorado', size:'Talla libre', finish:'Mate',
    features:['Se ajustan a cualquier dedo','Dos diseños en un solo pedido','Fáciles de combinar']},
  {id:'r1', name:'Argollas doradas', cat:'aretes', price:32000,
    desc:'Argollas medianas bañadas en oro, un básico que nunca falla.',
    material:'Baño de oro', size:'2 cm de diámetro', finish:'Brillante',
    features:['Cierre a presión seguro','Livianas para uso todo el día','Combinan con cualquier outfit']},
  {id:'r2', name:'Aretes colgantes perla', cat:'aretes', price:42000,
    desc:'Aretes colgantes con perla sintética, elegantes para el día o la noche.',
    material:'Acero + perla sintética', size:'4 cm de largo', finish:'Pulido',
    features:['Diseño colgante elegante','Perla resistente al uso','Perfectos para eventos']},
  {id:'r3', name:'Topos mini', cat:'aretes', price:25000,
    desc:'Topos pequeños para uso diario, discretos y cómodos.',
    material:'Acero quirúrgico', size:'0.6 cm', finish:'Mate',
    features:['Ideal para piel sensible','Tamaño discreto','Se pueden usar todo el día']}
];

var CAT_LABELS = {cadena:'Cadena', manilla:'Manilla', anillo:'Anillo', aretes:'Aretes'};
var ADMIN_EMAIL = 'admin@tljoyeria.com';
var WHATSAPP_NUMBER = '573215203260';
var WHATSAPP_URL = 'https://wa.me/' + WHATSAPP_NUMBER;

function openWhatsApp(message){
  var url = WHATSAPP_URL;
  if(message && message.trim()) url += '?text=' + encodeURIComponent(message);
  window.open(url, '_blank');
}

function placeholderImg(name){
  return 'https://placehold.co/700x560/15181c/ffffff?text=' + encodeURIComponent(name);
}

function formatCOP(n){
  return '$' + Number(n).toLocaleString('es-CO');
}

/* ---------- Persistencia de productos (permite al admin editar el catálogo) ---------- */
var products = [];
function loadProducts(){
  try{
    var saved = JSON.parse(localStorage.getItem('tl_products'));
    if(saved && Array.isArray(saved) && saved.length) { products = saved; return; }
  }catch(e){}
  products = DEFAULT_PRODUCTS.slice();
  saveProducts();
}
function saveProducts(){
  try{ localStorage.setItem('tl_products', JSON.stringify(products)); }catch(e){}
}

/* ---------- Estado del catálogo (filtro + búsqueda) ---------- */
var currentFilter = 'todos';
var currentSearch = '';

function renderProducts(){
  var grid = document.getElementById('productGrid');
  grid.innerHTML = '';

  var list = products.filter(function(p){
    var matchesFilter = currentFilter === 'todos' || p.cat === currentFilter;
    var matchesSearch = !currentSearch || p.name.toLowerCase().indexOf(currentSearch) !== -1 ||
      (CAT_LABELS[p.cat] || '').toLowerCase().indexOf(currentSearch) !== -1;
    return matchesFilter && matchesSearch;
  });

  if(list.length === 0){
    grid.innerHTML = '<div class="empty-results">No se encontraron productos con ese filtro o búsqueda.</div>';
    return;
  }

  list.forEach(function(p){
    var card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-id', p.id);
    card.innerHTML =
      '<div class="card-img"><img src="' + (p.image || placeholderImg(p.name)) + '" alt="' + p.name + '"></div>' +
      '<div class="card-body">' +
        '<h3>' + p.name + '</h3>' +
        '<p class="desc">' + p.desc + '</p>' +
        '<div class="price">' + formatCOP(p.price) + '</div>' +
        '<button class="btn small" data-add="' + p.id + '">Agregar al carrito</button>' +
      '</div>';
    card.addEventListener('click', function(e){
      if(e.target.closest('[data-add]')) return;
      openProductModal(p.id);
    });
    grid.appendChild(card);
  });

  grid.querySelectorAll('[data-add]').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      addToCart(btn.getAttribute('data-add'));
    });
  });
}

document.getElementById('filters').addEventListener('click', function(e){
  if(e.target.classList.contains('filter-btn')){
    document.querySelectorAll('.filter-btn').forEach(function(b){ b.classList.remove('active'); });
    e.target.classList.add('active');
    currentFilter = e.target.getAttribute('data-filter');
    renderProducts();
  }
});

var searchInput = document.getElementById('globalSearch');
if(searchInput){
  searchInput.addEventListener('input', function(){
    currentSearch = searchInput.value.trim().toLowerCase();
    renderProducts();
    var catalogo = document.getElementById('catalogo');
    if(currentSearch && catalogo) catalogo.scrollIntoView({behavior:'smooth', block:'start'});
  });
}

/* ---------- Carrusel de destacados ---------- */
var slides = document.querySelectorAll('.featured-slide');
var dots = document.querySelectorAll('.dot');
var currentSlide = 0;
var slideTimer = null;

function goToSlide(index){
  if(!slides.length) return;
  currentSlide = (index + slides.length) % slides.length;
  slides.forEach(function(s, i){ s.classList.toggle('active', i === currentSlide); });
  dots.forEach(function(d, i){ d.classList.toggle('active', i === currentSlide); });
}

function startSlideTimer(){
  clearInterval(slideTimer);
  slideTimer = setInterval(function(){ goToSlide(currentSlide + 1); }, 6000);
}

dots.forEach(function(dot, i){
  dot.addEventListener('click', function(){
    goToSlide(i);
    startSlideTimer();
  });
});
if(slides.length) startSlideTimer();

/* ---------- Modal de detalle de producto ---------- */
var productModal = document.getElementById('productModal');
var activeProductId = null;

function openProductModal(id){
  var p = products.find(function(pr){ return pr.id === id; });
  if(!p) return;
  activeProductId = id;
  document.getElementById('productDetailImage').src = p.image || placeholderImg(p.name);
  document.getElementById('productDetailImage').alt = p.name;
  document.getElementById('productDetailCategory').textContent = CAT_LABELS[p.cat] || p.cat;
  document.getElementById('productDetailName').textContent = p.name;
  document.getElementById('productDetailPrice').textContent = formatCOP(p.price);
  document.getElementById('productDetailSku').textContent = 'SKU: TL-' + p.id.toUpperCase();
  document.getElementById('productDetailDesc').textContent = p.desc;
  document.getElementById('productDetailMaterial').textContent = p.material || '—';
  document.getElementById('productDetailSize').textContent = p.size || '—';
  document.getElementById('productDetailFinish').textContent = p.finish || '—';

  var featuresList = document.getElementById('productDetailFeatures');
  featuresList.innerHTML = '';
  (p.features || []).forEach(function(f){
    var li = document.createElement('li');
    li.textContent = f;
    featuresList.appendChild(li);
  });

  productModal.classList.add('active');
  productModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeProductModal(){
  productModal.classList.remove('active');
  productModal.setAttribute('aria-hidden', 'true');
  if(!accountPage.classList.contains('active')) document.body.style.overflow = '';
}

document.getElementById('productModalClose').addEventListener('click', closeProductModal);
document.getElementById('productModalBackdrop').addEventListener('click', closeProductModal);
document.getElementById('productDetailContinue').addEventListener('click', closeProductModal);
document.getElementById('productDetailBuy').addEventListener('click', function(){
  if(activeProductId) addToCart(activeProductId);
  closeProductModal();
});

/* ---------- Carrito ---------- */
var cart = [];
try{
  var savedCart = localStorage.getItem('tl_cart');
  if(savedCart) cart = JSON.parse(savedCart);
}catch(e){ cart = []; }

function saveCart(){
  try{ localStorage.setItem('tl_cart', JSON.stringify(cart)); }catch(e){}
}

function addToCart(id){
  var item = cart.find(function(i){ return i.id === id; });
  if(item){ item.qty++; }
  else{
    var p = products.find(function(pr){ return pr.id === id; });
    if(!p) return;
    cart.push({id:p.id, name:p.name, price:p.price, qty:1});
  }
  saveCart();
  renderCart();
  openCartPanel();
}

function changeQty(id, delta){
  var item = cart.find(function(i){ return i.id === id; });
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0) cart = cart.filter(function(i){ return i.id !== id; });
  saveCart();
  renderCart();
}

function removeItem(id){
  cart = cart.filter(function(i){ return i.id !== id; });
  saveCart();
  renderCart();
}

function renderCart(){
  var container = document.getElementById('cartItems');
  var totalEl = document.getElementById('cartTotal');
  var badge = document.getElementById('cartBadge');
  var checkoutBtn = document.getElementById('checkoutBtn');
  container.innerHTML = '';

  if(cart.length === 0){
    container.innerHTML = '<p class="cart-empty">Tu carrito está vacío.</p>';
  }else{
    cart.forEach(function(item){
      var row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML =
        '<div class="cart-item-info">' +
          '<strong>' + item.name + '</strong>' +
          '<span>' + formatCOP(item.price) + ' c/u</span>' +
          '<div class="qty-row">' +
            '<button data-dec="' + item.id + '">−</button>' +
            '<span>' + item.qty + '</span>' +
            '<button data-inc="' + item.id + '">+</button>' +
            '<button class="remove-btn" data-remove="' + item.id + '">Quitar</button>' +
          '</div>' +
        '</div>';
      container.appendChild(row);
    });
  }

  var total = cart.reduce(function(sum, i){ return sum + i.price * i.qty; }, 0);
  var count = cart.reduce(function(sum, i){ return sum + i.qty; }, 0);
  totalEl.textContent = formatCOP(total);
  checkoutBtn.disabled = cart.length === 0;

  if(count > 0){
    badge.style.display = 'flex';
    badge.textContent = count;
    badge.classList.remove('pulse');
    void badge.offsetWidth;
    badge.classList.add('pulse');
  }else{
    badge.style.display = 'none';
  }

  container.querySelectorAll('[data-inc]').forEach(function(b){ b.addEventListener('click', function(){ changeQty(b.getAttribute('data-inc'), 1); }); });
  container.querySelectorAll('[data-dec]').forEach(function(b){ b.addEventListener('click', function(){ changeQty(b.getAttribute('data-dec'), -1); }); });
  container.querySelectorAll('[data-remove]').forEach(function(b){ b.addEventListener('click', function(){ removeItem(b.getAttribute('data-remove')); }); });
}

/* Selección de método de pago */
document.getElementById('payMethods').addEventListener('click', function(e){
  var label = e.target.closest('.pay-option');
  if(!label) return;
  document.querySelectorAll('.pay-option').forEach(function(l){ l.classList.remove('selected'); });
  label.classList.add('selected');
});

document.getElementById('checkoutBtn').addEventListener('click', function(){
  if(cart.length === 0) return;
  var payInput = document.querySelector('input[name="pay"]:checked');
  var payMethod = payInput ? payInput.value : 'Contraentrega';
  var lines = cart.map(function(i){ return '- ' + i.name + ' x' + i.qty + ' (' + formatCOP(i.price * i.qty) + ')'; });
  var total = cart.reduce(function(sum, i){ return sum + i.price * i.qty; }, 0);
  var msg = 'Hola, quiero hacer este pedido:\n' + lines.join('\n') + '\nTotal: ' + formatCOP(total) + '\nMétodo de pago: ' + payMethod;
  openWhatsApp(msg);
});

/* ---------- Panel de carrito (abrir/cerrar) ---------- */
var cartPanel = document.getElementById('cartPanel');
var overlay = document.getElementById('overlay');
function openCartPanel(){ cartPanel.classList.add('active'); overlay.classList.add('active'); }
function closeCartPanel(){ cartPanel.classList.remove('active'); if(!sidebar.classList.contains('active')) overlay.classList.remove('active'); }
document.getElementById('openCart').addEventListener('click', openCartPanel);
document.getElementById('closeCart').addEventListener('click', closeCartPanel);

/* ---------- Sidebar ---------- */
var sidebar = document.getElementById('sidebar');
function openSidebarFn(){ sidebar.classList.add('active'); overlay.classList.add('active'); }
function closeSidebar(){ sidebar.classList.remove('active'); if(!cartPanel.classList.contains('active')) overlay.classList.remove('active'); }
document.getElementById('openSidebar').addEventListener('click', openSidebarFn);
document.getElementById('closeSidebar').addEventListener('click', closeSidebar);
overlay.addEventListener('click', function(){ closeCartPanel(); closeSidebar(); });

/* ---------- Formulario de pedido rápido ---------- */
document.getElementById('orderForm').addEventListener('submit', function(e){
  e.preventDefault();
  var name = document.getElementById('name').value.trim();
  var category = document.getElementById('category').value;
  var details = document.getElementById('details').value.trim();
  var msg = 'Hola, soy ' + name + '. Quiero hacer un pedido de: ' + category + '. Detalles: ' + (details || 'sin detalles adicionales');
  openWhatsApp(msg);
});

/* ======================================================
   Cuenta: login / registro / recuperación / panel admin
====================================================== */
var accountPage = document.getElementById('accountPage');
var authViews = document.getElementById('authViews');
var dashboard = document.getElementById('dashboard');
var recoveryPanel = document.getElementById('recoveryPanel');
var authFeedback = document.getElementById('authFeedback');
var adminPanel = document.getElementById('adminPanel');

function showFeedback(message, type){
  authFeedback.textContent = message;
  authFeedback.className = 'auth-feedback ' + (type || 'info');
}
function clearFeedback(){
  authFeedback.textContent = '';
  authFeedback.className = 'auth-feedback';
}

/* "Base de datos" de usuarios, solo en este navegador */
function loadUsers(){
  try{ return JSON.parse(localStorage.getItem('tl_users')) || {}; }catch(e){ return {}; }
}
function saveUsers(users){
  try{ localStorage.setItem('tl_users', JSON.stringify(users)); }catch(e){}
}

document.getElementById('openAccount').addEventListener('click', function(){
  accountPage.classList.add('active');
  document.body.style.overflow = 'hidden';
});
document.getElementById('closeAccount').addEventListener('click', function(){
  accountPage.classList.remove('active');
  document.body.style.overflow = '';
});

document.querySelectorAll('.auth-tabs .tab-btn').forEach(function(tab){
  tab.addEventListener('click', function(){
    document.querySelectorAll('.auth-tabs .tab-btn').forEach(function(t){ t.classList.remove('active'); });
    document.querySelectorAll('.auth-form').forEach(function(f){ f.classList.remove('active'); });
    tab.classList.add('active');
    clearFeedback();
    document.getElementById(tab.getAttribute('data-tab') + 'Form').classList.add('active');
  });
});

function setUser(name, email){
  var label = document.getElementById('userLabel');
  label.textContent = name;
  label.classList.add('show');
  try{ localStorage.setItem('tl_session', email); }catch(e){}

  authViews.classList.add('hidden');
  recoveryPanel.classList.remove('active');
  dashboard.classList.add('active');
  document.getElementById('dashWelcome').textContent = 'Hola, ' + name;
  document.getElementById('dashEmail').textContent = email;

  if(email === ADMIN_EMAIL){
    try {
      localStorage.setItem('tl_session', email);
      window.location.href = 'admin.html';
    } catch (e) {}
    return;
  }

  if(adminPanel) adminPanel.style.display = 'none';
}

function logoutUser(){
  try{ localStorage.removeItem('tl_session'); }catch(e){}
  dashboard.classList.remove('active');
  authViews.classList.remove('hidden');
  document.getElementById('userLabel').classList.remove('show');
  if(adminPanel) adminPanel.style.display = 'none';
  if(adminDashboardPage) adminDashboardPage.classList.remove('active');
  clearFeedback();
  if (window.location.pathname.toLowerCase().endsWith('admin.html')) {
    window.location.href = 'index.html';
  }
}

var adminDashboardPage = document.getElementById('adminDashboardPage');
var DEFAULT_ADMIN_ORDERS = [
  {id:'PED-1042', client:'María P.', total:85000, status:'En preparación', item:'Cadena cubana plata', completed:false},
  {id:'PED-1041', client:'Daniel R.', total:65000, status:'Pendiente', item:'Cadena fina dorada', completed:false},
  {id:'PED-1040', client:'Sofía L.', total:35000, status:'Enviado', item:'Manilla ajustable dorada', completed:false},
  {id:'PED-1039', client:'Camila V.', total:42000, status:'Completado', item:'Aretes colgantes perla', completed:true}
];
var DEFAULT_ADMIN_USERS = [
  {name:'Jacob Torres', email:'admin@tljoyeria.com', role:'Propietario'},
  {name:'María P.', email:'maria@email.com', role:'Cliente'},
  {name:'Daniel R.', email:'daniel@email.com', role:'Cliente'},
  {name:'Sofía L.', email:'sofia@email.com', role:'Cliente'}
];

function loadAdminOrders(){
  try{
    var saved = JSON.parse(localStorage.getItem('tl_admin_orders'));
    if(saved && Array.isArray(saved) && saved.length) return saved;
  }catch(e){}
  return DEFAULT_ADMIN_ORDERS.slice();
}
function saveAdminOrders(orders){
  try{ localStorage.setItem('tl_admin_orders', JSON.stringify(orders)); }catch(e){}
}
function loadAdminUsers(){
  try{
    var saved = JSON.parse(localStorage.getItem('tl_admin_users'));
    if(saved && Array.isArray(saved) && saved.length) return saved;
  }catch(e){}
  return DEFAULT_ADMIN_USERS.slice();
}
function saveAdminUsers(users){
  try{ localStorage.setItem('tl_admin_users', JSON.stringify(users)); }catch(e){}
}
function loadAboutContent(){
  var saved = localStorage.getItem('tl_about_text');
  if(saved && saved.trim()) return saved;
  return 'TL Joyería nació con una idea simple: piezas de calidad, a precios justos, sin complicarse la vida para comprarlas. Cada producto se elige a mano pensando en que se vea bien y aguante el uso diario. Trabajamos por pedido, así que siempre podemos ayudarte a encontrar la pieza exacta que buscas o armar un set completo.';
}
function saveAboutContent(text){
  try{ localStorage.setItem('tl_about_text', text); }catch(e){}
  var aboutText = document.querySelector('#nosotros p');
  if(aboutText){ aboutText.textContent = text; }
}

function renderAdminDashboard(){
  var productsMetric = document.getElementById('adminMetricProducts');
  var ordersMetric = document.getElementById('adminMetricOrders');
  var pendingMetric = document.getElementById('adminMetricPending');
  var revenueMetric = document.getElementById('adminMetricRevenue');

  if(!productsMetric && !ordersMetric && !pendingMetric && !revenueMetric && !document.getElementById('adminOrdersList') && !document.getElementById('adminCategoriesList') && !document.getElementById('adminUsersList')){
    return;
  }

  var orders = loadAdminOrders();
  var users = loadAdminUsers();
  var completedRevenue = orders.reduce(function(sum, order){
    return sum + (order.completed || order.status === 'Completado' ? Number(order.total || 0) : 0);
  }, 0);
  var pending = orders.filter(function(order){ return !(order.completed || order.status === 'Completado'); }).length;

  if(productsMetric) productsMetric.textContent = String(products.length);
  if(ordersMetric) ordersMetric.textContent = String(orders.length);
  if(pendingMetric) pendingMetric.textContent = String(pending);
  if(revenueMetric) revenueMetric.textContent = formatCOP(completedRevenue);

  var ordersList = document.getElementById('adminOrdersList');
  if(ordersList){
    ordersList.innerHTML = orders.map(function(order){
      var done = !!order.completed || order.status === 'Completado';
      return '<div class="admin-order-row">' +
        '<div><strong>' + order.id + '</strong><small>' + order.client + ' · ' + order.item + '</small></div>' +
        '<div><strong>' + formatCOP(order.total) + '</strong><small>' + (done ? 'Cobrado' : 'Sin cobrar') + '</small></div>' +
        '<select data-order-status="' + order.id + '">' +
          ['Pendiente','Confirmado','En preparación','Enviado','Completado'].map(function(status){
            return '<option value="' + status + '"' + (status === order.status ? ' selected' : '') + '>' + status + '</option>';
          }).join('') +
        '</select>' +
        '<button type="button" class="admin-order-toggle' + (done ? ' done' : '') + '" data-order-toggle="' + order.id + '">' + (done ? 'Venta completada' : 'Marcar venta completa') + '</button>' +
      '</div>';
    }).join('');

    ordersList.querySelectorAll('[data-order-status]').forEach(function(select){
      select.addEventListener('change', function(){
        var id = select.getAttribute('data-order-status');
        var ordersData = loadAdminOrders();
        var entry = ordersData.find(function(order){ return order.id === id; });
        if(!entry) return;
        entry.status = select.value;
        entry.completed = select.value === 'Completado';
        saveAdminOrders(ordersData.map(function(order){ return order.id === id ? entry : order; }));
        renderAdminDashboard();
      });
    });

    ordersList.querySelectorAll('[data-order-toggle]').forEach(function(button){
      button.addEventListener('click', function(){
        var id = button.getAttribute('data-order-toggle');
        var ordersData = loadAdminOrders();
        var entry = ordersData.find(function(order){ return order.id === id; });
        if(!entry) return;
        entry.completed = !entry.completed;
        entry.status = entry.completed ? 'Completado' : 'Pendiente';
        saveAdminOrders(ordersData.map(function(order){ return order.id === id ? entry : order; }));
        renderAdminDashboard();
      });
    });
  }

  var categoriesList = document.getElementById('adminCategoriesList');
  if(categoriesList){
    var categories = ['cadena','manilla','anillo','aretes'];
    categoriesList.innerHTML = categories.map(function(cat){
      var count = products.filter(function(p){ return p.cat === cat; }).length;
      return '<div class="admin-mini-item"><div class="meta"><span class="dot"></span><div><strong>' + (CAT_LABELS[cat] || cat) + '</strong><small>' + count + ' productos</small></div></div><strong>' + count + '</strong></div>';
    }).join('');
  }

  var usersList = document.getElementById('adminUsersList');
  if(usersList){
    usersList.innerHTML = users.map(function(user){
      return '<div class="admin-mini-item"><div class="meta"><span class="dot"></span><div><strong>' + user.name + '</strong><small>' + user.email + '</small></div></div><strong>' + user.role + '</strong></div>';
    }).join('');
  }

  var aboutEditor = document.getElementById('adminAboutText');
  if(aboutEditor){
    aboutEditor.value = loadAboutContent();
  }
}

function setAdminSection(section){
  var navButtons = document.querySelectorAll('.admin-nav-item');
  navButtons.forEach(function(button){
    button.classList.toggle('active', button.getAttribute('data-section') === section);
  });
  document.querySelectorAll('.admin-section').forEach(function(panel){
    panel.classList.toggle('active', panel.getAttribute('data-section-target') === section);
  });
}

function bindAdminNavigation(){
  document.querySelectorAll('.admin-nav-item').forEach(function(button){
    button.addEventListener('click', function(){
      setAdminSection(button.getAttribute('data-section'));
    });
  });
}

function showAdminDashboardPage(){
  if(adminDashboardPage){
    adminDashboardPage.classList.add('active');
    document.body.style.overflow = 'hidden';
    bindAdminNavigation();
    setAdminSection('resumen');
    renderAdminDashboard();
    renderAdminList();
  }
}

function hideAdminDashboardPage(){
  if(adminDashboardPage){
    adminDashboardPage.classList.remove('active');
  }
  document.body.style.overflow = '';
}

function syncAboutTextFromEditor(){
  var editor = document.getElementById('adminAboutText');
  if(!editor) return;
  var text = editor.value.trim();
  if(!text) return;
  saveAboutContent(text);
}

var adminBackToAccountBtn = document.getElementById('adminBackToAccount');
if(adminBackToAccountBtn){
  adminBackToAccountBtn.addEventListener('click', function(){
    hideAdminDashboardPage();
    var accountPage = document.getElementById('accountPage');
    if(accountPage){ accountPage.classList.add('active'); }
  });
}

var adminLogoutBtn = document.getElementById('adminLogoutBtn');
if(adminLogoutBtn){
  adminLogoutBtn.addEventListener('click', function(){
    logoutUser();
    hideAdminDashboardPage();
  });
}

var saveAboutBtn = document.getElementById('saveAboutBtn');
if(saveAboutBtn){
  saveAboutBtn.addEventListener('click', function(){
    syncAboutTextFromEditor();
    showFeedback('Se actualizó la sección “Nosotros”.', 'success');
  });
}

document.getElementById('loginForm').addEventListener('submit', function(e){
  e.preventDefault();
  var email = document.getElementById('loginEmail').value.trim().toLowerCase();
  var pass = document.getElementById('loginPass').value;
  var users = loadUsers();

  if(email === ADMIN_EMAIL){
    setUser('Admin', email);
    return;
  }
  if(!users[email]){
    showFeedback('Ese correo no está registrado. Prueba creando una cuenta.', 'error');
    return;
  }
  if(users[email].password !== pass){
    showFeedback('La contraseña no es correcta.', 'error');
    return;
  }
  clearFeedback();
  setUser(users[email].name, email);
});

document.getElementById('registerForm').addEventListener('submit', function(e){
  e.preventDefault();
  var name = document.getElementById('regName').value.trim();
  var email = document.getElementById('regEmail').value.trim().toLowerCase();
  var pass = document.getElementById('regPass').value;
  var users = loadUsers();

  if(users[email]){
    showFeedback('Ese correo ya tiene una cuenta. Intenta iniciar sesión.', 'error');
    return;
  }
  users[email] = {name:name, password:pass};
  saveUsers(users);
  clearFeedback();
  setUser(name, email);
});

/* Recuperar contraseña */
document.getElementById('forgotPasswordBtn').addEventListener('click', function(){
  authViews.classList.add('hidden');
  recoveryPanel.classList.add('active');
  clearFeedback();
});
document.getElementById('backToLoginBtn').addEventListener('click', function(){
  recoveryPanel.classList.remove('active');
  authViews.classList.remove('hidden');
});
document.getElementById('recoverForm').addEventListener('submit', function(e){
  e.preventDefault();
  var email = document.getElementById('recoverEmail').value.trim().toLowerCase();
  var newPass = document.getElementById('recoverPass').value;
  var users = loadUsers();

  if(!users[email]){
    alert('No encontramos una cuenta con ese correo.');
    return;
  }
  users[email].password = newPass;
  saveUsers(users);
  recoveryPanel.classList.remove('active');
  authViews.classList.remove('hidden');
  showFeedback('Contraseña actualizada. Ya puedes iniciar sesión.', 'success');
});

document.getElementById('logoutBtn').addEventListener('click', logoutUser);

var adminPageFeedback = document.getElementById('adminDashboardPage');

/* Botones sociales: demo visual, no hay proveedor real conectado */
document.querySelectorAll('.social-btn').forEach(function(btn){
  btn.addEventListener('click', function(){
    showFeedback('El inicio de sesión con redes es solo una vista de muestra en este sitio.', 'info');
    authFeedback.style.display = 'block';
  });
});

/* ---------- Panel de administración de productos ---------- */
var adminForm = document.getElementById('adminProductForm');

function renderAdminList(){
  var list = document.getElementById('adminProductsList');
  list.innerHTML = '';
  products.forEach(function(p){
    var row = document.createElement('div');
    row.className = 'admin-product-item';
    row.innerHTML =
      '<div>' +
        '<strong>' + p.name + '</strong>' +
        '<span>' + (CAT_LABELS[p.cat] || p.cat) + ' · ' + formatCOP(p.price) + '</span>' +
      '</div>' +
      '<div class="admin-product-actions">' +
        '<button type="button" data-edit="' + p.id + '">Editar</button>' +
        '<button type="button" class="danger" data-delete="' + p.id + '">Eliminar</button>' +
      '</div>';
    list.appendChild(row);
  });

  list.querySelectorAll('[data-edit]').forEach(function(btn){
    btn.addEventListener('click', function(){ fillAdminForm(btn.getAttribute('data-edit')); });
  });
  list.querySelectorAll('[data-delete]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var id = btn.getAttribute('data-delete');
      if(!confirm('¿Eliminar este producto del catálogo?')) return;
      products = products.filter(function(p){ return p.id !== id; });
      saveProducts();
      renderAdminList();
      renderProducts();
    });
  });
}

function fillAdminForm(id){
  var p = products.find(function(pr){ return pr.id === id; });
  if(!p) return;
  document.getElementById('adminProductId').value = p.id;
  document.getElementById('adminProductName').value = p.name;
  document.getElementById('adminProductCat').value = p.cat;
  document.getElementById('adminProductPrice').value = p.price;
  document.getElementById('adminProductDesc').value = p.desc || '';
}

function resetAdminForm(){
  if(adminForm){ adminForm.reset(); }
  var idInput = document.getElementById('adminProductId');
  if(idInput){ idInput.value = ''; }
}

var newProductBtn = document.getElementById('newProductBtn');
if(newProductBtn){ newProductBtn.addEventListener('click', resetAdminForm); }
var cancelProductBtn = document.getElementById('cancelProductBtn');
if(cancelProductBtn){ cancelProductBtn.addEventListener('click', resetAdminForm); }

if(adminForm){
  adminForm.addEventListener('submit', function(e){
    e.preventDefault();
    var id = document.getElementById('adminProductId').value;
    var name = document.getElementById('adminProductName').value.trim();
    var cat = document.getElementById('adminProductCat').value;
    var price = parseInt(document.getElementById('adminProductPrice').value, 10) || 0;
    var desc = document.getElementById('adminProductDesc').value.trim();

    if(id){
      var existing = products.find(function(p){ return p.id === id; });
      if(existing){
        existing.name = name; existing.cat = cat; existing.price = price; existing.desc = desc;
        existing.image = placeholderImg(name);
      }
    }else{
      var newId = cat.charAt(0) + Date.now().toString(36);
      products.push({
        id:newId, name:name, cat:cat, price:price, desc:desc,
        material:'—', size:'—', finish:'—', features:[], image:placeholderImg(name)
      });
    }
    saveProducts();
    resetAdminForm();
    renderAdminList();
    renderProducts();
    renderAdminDashboard();
  });
}

/* ---------- Inicio ---------- */
loadProducts();
renderProducts();
renderCart();
renderAdminDashboard();
goToSlide(0);

try{
  var sessionEmail = localStorage.getItem('tl_session');
  if(sessionEmail){
    if(sessionEmail === ADMIN_EMAIL){
      setUser('Admin', sessionEmail);
    }else{
      var users = loadUsers();
      if(users[sessionEmail]) setUser(users[sessionEmail].name, sessionEmail);
    }
  }
}catch(e){}
