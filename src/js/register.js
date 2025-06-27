// Lógica JS para el registro de usuario

document.getElementById('registerForm').onsubmit = async (e) => {
  e.preventDefault();
  const user = document.getElementById('user').value;
  const pass = document.getElementById('pass').value;
  const role = document.getElementById('role').value;
  const msg = document.getElementById('msg');
  msg.textContent = '';
  try {
    const res = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ user, pass, role })
    });
    const data = await res.json();
    if (res.ok) {
      msg.style.color = '#0f0';
      msg.textContent = `Usuario ${data.user} creado como ${data.role}`;
    } else {
      msg.style.color = '#f44';
      msg.textContent = data.error || 'Error al registrar';
      if (res.status === 401 || res.status === 403) {
        setTimeout(() => window.location.href = 'index.html', 1500);
      }
    }
  } catch (err) {
    msg.style.color = '#f44';
    msg.textContent = 'Error de red';
  }
};
