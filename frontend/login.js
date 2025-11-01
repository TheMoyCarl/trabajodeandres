const BASE_URL = 'http://127.0.0.1:5000';

function showMessage(msg, timeout = 5000) {
  const el = document.getElementById('message');
  if (!el) return;
  el.hidden = false;
  el.textContent = msg;
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.hidden = true; }, timeout);
}

function renderAuthTabs(tab) {
  const body = document.getElementById('auth-body');
  if (!body) return;
  if (tab === 'login') {
    body.innerHTML = `<h2>Iniciar sesión</h2><div class='form-row'><label>Usuario</label><input id='f-username'/></div><div class='form-row'><label>Contraseña</label><input id='f-password' type='password'/></div><div class='form-row'><label>Rol</label><select id='f-role'><option value='admin'>Administrador</option><option value='user'>Usuario</option></select></div><div class='form-actions'><button id='do-login' class='btn btn-primary'>Entrar</button></div>`;
    const doLogin = document.getElementById('do-login');
    if (doLogin) doLogin.addEventListener('click', async () => {
      const u = document.getElementById('f-username').value;
      const p = document.getElementById('f-password').value;
      try {
        const res = await fetch(BASE_URL + '/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: u, password: p })
        });
        const data = await res.json();
        if (!res.ok) throw data;
        localStorage.setItem('jwt_token', data.access_token);
        // Decodifica el JWT para obtener el rol
        const payload = JSON.parse(atob(data.access_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        localStorage.setItem('jwt_role', payload.role);
        localStorage.setItem('jwt_username', u);
        showMessage('Inicio de sesión correcto');
        setTimeout(() => { window.location.href = 'index.html'; }, 1000);
      } catch (e) {
        showMessage('Error: ' + (e.error || JSON.stringify(e)));
      }
    });
  } else {
    body.innerHTML = `<h2>Registrar usuario</h2><div class='form-row'><label>Usuario</label><input id='r-username'/></div><div class='form-row'><label>Contraseña</label><input id='r-password' type='password'/></div><div class='form-row'><label>Rol</label><select id='r-role'><option value='admin'>Administrador</option><option value='user' selected>Usuario</option></select></div><div class='form-actions'><button id='do-register' class='btn btn-primary'>Crear</button></div>`;
    const doRegister = document.getElementById('do-register');
    if (doRegister) doRegister.addEventListener('click', async () => {
      const u = document.getElementById('r-username').value;
      const p = document.getElementById('r-password').value;
      const role = document.getElementById('r-role').value;
      try {
        const res = await fetch(BASE_URL + '/registry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: u, password: p, role })
        });
        const data = await res.json();
        if (!res.ok) throw data;
        showMessage('Usuario registrado, ahora inicia sesión');
        renderAuthTabs('login');
      } catch (e) {
        showMessage('Error: ' + (e.error || JSON.stringify(e)));
      }
    });
  }
}

function bindGlobal() {
  const tabLogin = document.getElementById('tab-login');
  if (tabLogin) tabLogin.addEventListener('click', () => renderAuthTabs('login'));
  const tabRegister = document.getElementById('tab-register');
  if (tabRegister) tabRegister.addEventListener('click', () => renderAuthTabs('register'));
}

document.addEventListener('DOMContentLoaded', () => {
  bindGlobal();
  renderAuthTabs('login');
});
