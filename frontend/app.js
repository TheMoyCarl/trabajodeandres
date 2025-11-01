const BASE_URL = 'http://127.0.0.1:5000';

const state = {
  token: localStorage.getItem('jwt_token') || null,
  role: localStorage.getItem('jwt_role') || null,
  username: localStorage.getItem('jwt_username') || null,
};

function authHeader() {
  return state.token ? { 'Authorization': `Bearer ${state.token}` } : {};
}

function showMessage(msg, timeout = 5000) {
  const el = document.getElementById('message');
  if (!el) return;
  el.hidden = false;
  el.textContent = msg;
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.hidden = true; }, timeout);
}

function clearContent() {
  const el = document.getElementById('content');
  if (el) el.innerHTML = '';
}
function createCard(title, bodyHtml) {
  const div = document.createElement('div');
  div.className = 'card';
  div.innerHTML = `<h3>${title}</h3><div>${bodyHtml}</div>`;
  return div;
}

async function apiFetch(path, opts = {}) {
  const headers = opts.headers || {};
  opts.headers = Object.assign({ 'Content-Type': 'application/json' }, headers, authHeader());
  const res = await fetch(BASE_URL + path, opts);
  let data = null;
  try { data = await res.json(); } catch (e) { data = null; }
  if (!res.ok) {
    const err = (data && data.error) ? data.error : (data && data.message) ? data.message : 'Error en la petición';
    throw { status: res.status, message: err, body: data };
  }
  return data;
}

async function login(username, password) {
  const data = await apiFetch('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  state.token = data.access_token;
  localStorage.setItem('jwt_token', state.token);
  const payload = parseJwt(data.access_token);
  state.role = payload.role;
  state.username = payload.sub || payload.identity || username;
  localStorage.setItem('jwt_role', state.role);
  localStorage.setItem('jwt_username', state.username);
  showMessage('Inicio de sesión correcto');
}

async function register(username, password, role = 'user') {
  const data = await apiFetch('/registry', {
    method: 'POST',
    body: JSON.stringify({ username, password, role })
  });
  showMessage(`Usuario ${data.username} registrado`);
}

function parseJwt(token) {
  if (!token) return {};
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) { return {}; }
}

async function listBooks() { return await apiFetch('/books', { method: 'GET' }); }
async function getBookById(id) { return await apiFetch(`/books/${id}`, { method: 'GET' }); }
async function createBook(book) { return await apiFetch('/books', { method: 'POST', body: JSON.stringify(book) }); }
async function updateBook(id, book) { return await apiFetch(`/books/${id}`, { method: 'PUT', body: JSON.stringify(book) }); }
async function deleteBook(id) { return await apiFetch(`/books/${id}`, { method: 'DELETE' }); }

function renderBooks(list) {
  clearContent();
  const grid = document.getElementById('content');
  if (!grid) return;
  if (!list || list.length === 0) {
    grid.appendChild(createCard('Sin resultados', '<p class="small">No se encontraron libros.</p>'));
    return;
  }
  list.forEach(b => {
    let body = `<p class="small">Autor: ${escapeHtml(b.author)}</p><p class="small">Año: ${b.year || '-'} </p>`;
    if (state.role === 'admin') {
      body += `<div class="meta"><button class="btn" data-id="${b.id}" data-action="view">Ver</button><button class="btn" data-id="${b.id}" data-action="edit">Editar</button><button class="btn" data-id="${b.id}" data-action="delete">Eliminar</button></div>`;
    } else {
      body += `<div class="meta"><button class="btn" data-id="${b.id}" data-action="view">Ver</button></div>`;
    }
    grid.appendChild(createCard(escapeHtml(b.title), body));
  });
}

function renderBook(b) {
  clearContent();
  const grid = document.getElementById('content');
  if (!grid) return;
  const body = `<p class="small">Autor: ${escapeHtml(b.author)}</p><p class="small">Año: ${b.year || '-'} </p>`;
  grid.appendChild(createCard(escapeHtml(b.title), body));
}

function escapeHtml(text) {
  if (!text) return '';
  return text.toString().replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function openModal(html) {
  const modal = document.getElementById('modal');
  if (!modal) return;
  document.getElementById('modal-body').innerHTML = html;
  modal.setAttribute('aria-hidden', 'false');
}
function closeModal() {
  const modal = document.getElementById('modal');
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'true');
}

function showAuthScreen() {
  const auth = document.getElementById('auth-screen');
  const main = document.getElementById('main-screen');
  if (auth) auth.style.display = '';
  if (main) main.style.display = 'none';
  renderAuthTabs('login');
}
function showMainScreen() {
  const auth = document.getElementById('auth-screen');
  const main = document.getElementById('main-screen');
  if (auth) auth.style.display = 'none';
  if (main) main.style.display = '';
  const actions = document.querySelector('.actions');
  if (actions) actions.style.display = (state.role === 'admin') ? '' : 'none';
  refreshList();
}

function renderAuthTabs(tab) {
  const body = document.getElementById('auth-body');
  if (!body) return;
  if (tab === 'login') {
    body.innerHTML = `<h2>Iniciar sesión</h2><div class="form-row"><label>Usuario</label><input id="f-username"/></div><div class="form-row"><label>Contraseña</label><input id="f-password" type="password"/></div><div class="form-row"><label>Rol</label><select id="f-role"><option value="admin">Administrador</option><option value="user">Usuario</option></select></div><div class="form-actions"><button id="do-login" class="btn btn-primary">Entrar</button></div>`;
    const doLogin = document.getElementById('do-login');
    if (doLogin) doLogin.addEventListener('click', async () => {
      const u = document.getElementById('f-username').value;
      const p = document.getElementById('f-password').value;
      try {
        await login(u, p);
        showMainScreen();
      } catch (e) {
        showMessage('Error: ' + (e.message || JSON.stringify(e.body)));
      }
    });
  } else {
    body.innerHTML = `<h2>Registrar usuario</h2><div class="form-row"><label>Usuario</label><input id="r-username"/></div><div class="form-row"><label>Contraseña</label><input id="r-password" type="password"/></div><div class="form-row"><label>Rol</label><select id="r-role"><option value="admin">Administrador</option><option value="user" selected>Usuario</option></select></div><div class="form-actions"><button id="do-register" class="btn btn-primary">Crear</button></div>`;
    const doRegister = document.getElementById('do-register');
    if (doRegister) doRegister.addEventListener('click', async () => {
      const u = document.getElementById('r-username').value;
      const p = document.getElementById('r-password').value;
      const role = document.getElementById('r-role').value;
      try {
        await register(u, p, role);
        showMessage('Usuario registrado, ahora inicia sesión');
        renderAuthTabs('login');
      } catch (e) {
        showMessage('Error: ' + (e.message || JSON.stringify(e.body)));
      }
    });
  }
}

function bindGlobal() {
  const modalClose = document.getElementById('modal-close');
  if (modalClose) modalClose.addEventListener('click', closeModal);
  const tabLogin = document.getElementById('tab-login');
  if (tabLogin) tabLogin.addEventListener('click', () => renderAuthTabs('login'));
  const tabRegister = document.getElementById('tab-register');
  if (tabRegister) tabRegister.addEventListener('click', () => renderAuthTabs('register'));
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) btnLogout.addEventListener('click', () => {
    state.token = null;
    state.role = null;
    state.username = null;
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('jwt_role');
    localStorage.removeItem('jwt_username');
    showAuthScreen();
  });
  const btnNew = document.getElementById('btn-new');
  if (btnNew) btnNew.addEventListener('click', () => {
    openModal(`<h2>Agregar libro</h2><div class="form-row"><label>Título</label><input id="b-title"/></div><div class="form-row"><label>Autor</label><input id="b-author"/></div><div class="form-row"><label>Año</label><input id="b-year" type="number"/></div><div class="form-actions"><button id="do-create" class="btn btn-primary">Crear</button></div>`);
    const doCreate = document.getElementById('do-create');
    if (doCreate) doCreate.addEventListener('click', async () => {
      const title = document.getElementById('b-title').value;
      const author = document.getElementById('b-author').value;
      const year = parseInt(document.getElementById('b-year').value) || null;
      try {
        await createBook({ title, author, year });
        showMessage('Libro creado');
        closeModal();
        await refreshList();
      } catch (e) {
        showMessage('Error: ' + (e.message || JSON.stringify(e.body)));
      }
    });
  });
  const btnList = document.getElementById('btn-list');
  if (btnList) btnList.addEventListener('click', async () => { await refreshList(); });
  const btnSearch = document.getElementById('btn-search');
  if (btnSearch) btnSearch.addEventListener('click', async () => {
    const id = parseInt(document.getElementById('input-book-id').value);
    if (!id) { showMessage('Ingrese un ID válido'); return; }
    try {
      const b = await getBookById(id);
      renderBook(b);
    } catch (e) {
      showMessage('Error: ' + (e.message || JSON.stringify(e.body)));
    }
  });
  const contentEl = document.getElementById('content');
  if (contentEl) contentEl.addEventListener('click', async (ev) => {
    const btn = ev.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    if (action === 'view') {
      try {
        const b = await getBookById(id);
        renderBook(b);
      } catch (e) {
        showMessage('Error: ' + (e.message || JSON.stringify(e.body)));
      }
    } else if (action === 'edit' && state.role === 'admin') {
      try {
        const b = await getBookById(id);
        openModal(`<h2>Editar libro</h2><div class="form-row"><label>Título</label><input id="e-title" value="${escapeHtml(b.title)}"/></div><div class="form-row"><label>Autor</label><input id="e-author" value="${escapeHtml(b.author)}"/></div><div class="form-row"><label>Año</label><input id="e-year" type="number" value="${b.year || ''}"/></div><div class="form-actions"><button id="do-edit" class="btn btn-primary">Guardar</button></div>`);
        const doEdit = document.getElementById('do-edit');
        if (doEdit) doEdit.addEventListener('click', async () => {
          const title = document.getElementById('e-title').value;
          const author = document.getElementById('e-author').value;
          const year = parseInt(document.getElementById('e-year').value) || null;
          try {
            await updateBook(id, { title, author, year });
            showMessage('Libro actualizado');
            closeModal();
            await refreshList();
          } catch (e) {
            showMessage('Error: ' + (e.message || JSON.stringify(e.body)));
          }
        });
      } catch (e) {
        showMessage('Error: ' + (e.message || JSON.stringify(e.body)));
      }
    } else if (action === 'delete' && state.role === 'admin') {
      if (!confirm('¿Eliminar este libro?')) return;
      try {
        await deleteBook(id);
        showMessage('Libro eliminado');
        await refreshList();
      } catch (e) {
        showMessage('Error: ' + (e.message || JSON.stringify(e.body)));
      }
    }
  });
}

async function refreshList() {
  try {
    const books = await listBooks();
    renderBooks(books);
  } catch (e) {
    if (e.status === 401 || e.status === 403) {
      showMessage('Acceso denegado. Inicia sesión como administrador para listar y modificar libros.');
    } else showMessage('Error: ' + (e.message || JSON.stringify(e.body)));
  }
}


document.addEventListener('DOMContentLoaded', () => {
  if (!state.token) {
    window.location.href = 'login.html';
    return;
  }
  bindGlobal();
  showMainScreen();
});
