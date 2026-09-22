(function(){
  "use strict";

  var COLORS = [
    {id:'espresso', label:'Espresso bruin', hex:'#402E2A', light:false},
    {id:'rose', label:'Dusty rose', hex:'#E18498', light:false},
    {id:'blush', label:'Blush petal', hex:'#FFD7DB', light:true},
    {id:'almond', label:'Almond cream', hex:'#F5EADC', light:true}
  ];

  var PRODUCTS = [
    {id:'tile-square', kind:'Tegeltje', name:'Vierkant tegeltje', price:14.95, shape:'tile'},
    {id:'tile-round',  kind:'Tegeltje', name:'Rond tegeltje',     price:16.95, shape:'tile'},
    {id:'mug-classic', kind:'Mok',      name:'Klassieke mok',     price:19.95, shape:'mug'},
    {id:'mug-big',     kind:'Mok',      name:'XL mok',            price:22.95, shape:'mug'}
  ];

  function euro(n){ return '€' + n.toFixed(2).replace('.', ','); }

  function productIcon(shape, color){
    if(shape === 'mug'){
      return '<svg viewBox="0 0 100 100" fill="none"><path d="M22 30h44v34a14 14 0 0 1-14 14H36a14 14 0 0 1-14-14V30z" fill="'+color+'"/><path d="M66 40h6a10 10 0 0 1 0 20h-6" stroke="'+color+'" stroke-width="6" fill="none"/></svg>';
    }
    return '<svg viewBox="0 0 100 100" fill="none"><rect x="16" y="16" width="68" height="68" rx="6" fill="'+color+'"/><circle cx="50" cy="50" r="10" fill="rgba(255,255,255,0.5)"/></svg>';
  }

  var grid = document.getElementById('productGrid');
  PRODUCTS.forEach(function(p){
    var card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML =
      '<div class="product-thumb" style="background:#FFD7DB">' + productIcon(p.shape, '#402E2A') + '</div>' +
      '<div class="product-body">' +
        '<span class="product-kind">' + p.kind + '</span>' +
        '<span class="product-name">' + p.name + '</span>' +
        '<div class="product-price">' +
          '<span class="price-tag">' + euro(p.price) + '</span>' +
          '<button class="btn-small" data-id="'+ p.id +'">Personaliseer</button>' +
        '</div>' +
      '</div>';
    grid.appendChild(card);
  });

  /* ---------- state ---------- */
  var cart = [];
  var current = null;   // product being personalized
  var customState = { text:'', color: COLORS[0], qty:1, photo:null };

  /* ---------- modal elements ---------- */
  var overlay = document.getElementById('modalOverlay');
  var modalTitle = document.getElementById('modalTitle');
  var previewShape = document.getElementById('previewShape');
  var previewText = document.getElementById('previewText');
  var customText = document.getElementById('customText');
  var swatchWrap = document.getElementById('colorSwatches');
  var qtyValue = document.getElementById('qtyValue');
  var modalPrice = document.getElementById('modalPrice');
  var photoInput = document.getElementById('photoInput');
  var removePhotoBtn = document.getElementById('removePhotoBtn');

  COLORS.forEach(function(c, i){
    var b = document.createElement('button');
    b.className = 'swatch' + (i===0 ? ' active' : '');
    b.style.background = c.hex;
    b.setAttribute('role','radio');
    b.setAttribute('aria-checked', i===0 ? 'true':'false');
    b.setAttribute('aria-label', c.label);
    b.dataset.colorId = c.id;
    b.addEventListener('click', function(){
      customState.color = c;
      Array.prototype.forEach.call(swatchWrap.children, function(el){
        el.classList.remove('active'); el.setAttribute('aria-checked','false');
      });
      b.classList.add('active'); b.setAttribute('aria-checked','true');
      renderPreview();
    });
    swatchWrap.appendChild(b);
  });

  function renderPreview(){
    previewShape.classList.toggle('mug', current && current.shape === 'mug');
    if(customState.photo){
      previewShape.style.backgroundImage = 'url(' + customState.photo + ')';
      previewShape.style.background = customState.color.hex;
      previewShape.style.backgroundImage = 'url(' + customState.photo + ')';
      previewShape.style.backgroundSize = 'cover';
      previewShape.style.backgroundPosition = 'center';
    } else {
      previewShape.style.backgroundImage = 'none';
      previewShape.style.background = customState.color.hex;
    }
    previewText.textContent = customState.text || 'Jouw tekst hier';
    previewText.style.color = (customState.color.light && !customState.photo) ? '#402E2A' : '#F5EADC';
    removePhotoBtn.style.display = customState.photo ? 'inline-block' : 'none';
  }

  customText.addEventListener('input', function(){
    customState.text = customText.value;
    renderPreview();
  });

  photoInput.addEventListener('change', function(){
    var file = photoInput.files && photoInput.files[0];
    if(!file) return;
    var reader = new FileReader();
    reader.onload = function(e){
      customState.photo = e.target.result;
      renderPreview();
    };
    reader.readAsDataURL(file);
  });

  removePhotoBtn.addEventListener('click', function(){
    customState.photo = null;
    photoInput.value = '';
    renderPreview();
  });

  document.getElementById('qtyMinus').addEventListener('click', function(){
    customState.qty = Math.max(1, customState.qty - 1);
    qtyValue.textContent = customState.qty;
    updateModalPrice();
  });
  document.getElementById('qtyPlus').addEventListener('click', function(){
    customState.qty = Math.min(20, customState.qty + 1);
    qtyValue.textContent = customState.qty;
    updateModalPrice();
  });

  function updateModalPrice(){
    if(!current) return;
    modalPrice.textContent = euro(current.price * customState.qty);
  }

  function openModal(productId){
    current = PRODUCTS.filter(function(p){ return p.id === productId; })[0];
    if(!current) return;
    customState = { text:'', color: COLORS[0], qty:1, photo:null };
    customText.value = '';
    qtyValue.textContent = '1';
    photoInput.value = '';
    Array.prototype.forEach.call(swatchWrap.children, function(el, i){
      el.classList.toggle('active', i===0);
      el.setAttribute('aria-checked', i===0 ? 'true':'false');
    });
    modalTitle.textContent = 'Personaliseer je ' + current.name.toLowerCase();
    updateModalPrice();
    renderPreview();
    overlay.classList.add('open');
  }

  function closeModal(){ overlay.classList.remove('open'); }

  grid.addEventListener('click', function(e){
    var btn = e.target.closest('button[data-id]');
    if(btn) openModal(btn.dataset.id);
  });
  document.getElementById('closeModalBtn').addEventListener('click', closeModal);
  overlay.addEventListener('click', function(e){ if(e.target === overlay) closeModal(); });

  document.getElementById('addToCartBtn').addEventListener('click', function(){
    if(!current) return;
    cart.push({
      product: current,
      text: customState.text,
      color: customState.color,
      photo: customState.photo,
      qty: customState.qty
    });
    renderCart();
    closeModal();
    openCart();
  });

  /* ---------- cart drawer ---------- */
  var cartDrawer = document.getElementById('cartDrawer');
  var cartItemsEl = document.getElementById('cartItems');
  var cartCountEl = document.getElementById('cartCount');
  var cartTotalEl = document.getElementById('cartTotal');
  var checkoutFields = document.getElementById('checkoutFields');
  var cartActions = document.getElementById('cartActions');
  var confirmBox = document.getElementById('confirmBox');

  function openCart(){ cartDrawer.classList.add('open'); }
  function closeCart(){ cartDrawer.classList.remove('open'); }
  document.getElementById('openCartBtn').addEventListener('click', openCart);
  document.getElementById('closeCartBtn').addEventListener('click', closeCart);

  function renderCart(){
    cartCountEl.textContent = cart.reduce(function(s,i){ return s + i.qty; }, 0);
    if(cart.length === 0){
      cartItemsEl.innerHTML = '<div class="empty-cart">Je winkelwagen is nog leeg.</div>';
      cartTotalEl.textContent = euro(0);
      return;
    }
    var total = 0;
    cartItemsEl.innerHTML = '';
    cart.forEach(function(item, idx){
      total += item.product.price * item.qty;
      var thumbStyle = item.photo
        ? 'background-image:url(' + item.photo + ');'
        : 'background:' + item.color.hex + ';';
      var row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML =
        '<div class="cart-thumb" style="'+ thumbStyle +'"></div>' +
        '<div class="cart-item-info">' +
          '<div class="name">' + item.product.name + '</div>' +
          '<div class="meta">' + (item.text ? '"' + escapeHtml(item.text) + '" · ' : '') + item.color.label + ' · ' + item.qty + 'x</div>' +
          '<div class="cart-item-row">' +
            '<span class="cart-item-price">' + euro(item.product.price * item.qty) + '</span>' +
            '<button class="cart-remove" data-idx="'+ idx +'">Verwijderen</button>' +
          '</div>' +
        '</div>';
      cartItemsEl.appendChild(row);
    });
    cartTotalEl.textContent = euro(total);
  }

  function escapeHtml(s){
    return s.replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  cartItemsEl.addEventListener('click', function(e){
    var btn = e.target.closest('button[data-idx]');
    if(!btn) return;
    cart.splice(Number(btn.dataset.idx), 1);
    renderCart();
  });

  document.getElementById('toCheckoutBtn').addEventListener('click', function(){
    if(cart.length === 0) return;
    cartActions.style.display = 'none';
    checkoutFields.classList.add('open');
  });

  document.getElementById('placeOrderBtn').addEventListener('click', function(){
    var name = document.getElementById('custName').value.trim();
    var address = document.getElementById('custAddress').value.trim();
    var email = document.getElementById('custEmail').value.trim();
    if(!name || !address || !email){
      alert('Vul je naam, adres en e-mailadres in om te bestellen.');
      return;
    }
    checkoutFields.classList.remove('open');
    confirmBox.classList.add('open');
    cart = [];
    renderCart();
    setTimeout(function(){
      confirmBox.classList.remove('open');
      cartActions.style.display = 'block';
      document.getElementById('custName').value = '';
      document.getElementById('custAddress').value = '';
      document.getElementById('custEmail').value = '';
      closeCart();
    }, 2600);
  });

  renderCart();
})();
