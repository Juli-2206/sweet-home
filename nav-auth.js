// Muestra los links de navegación restringidos (.nav-admin)
// solo si hay sesión activa con rol admin o negocios
(function () {
  try {
    const usuario = JSON.parse(sessionStorage.getItem('sh_usuario'));
    if (usuario && (usuario.rol === 'admin' || usuario.rol === 'negocios')) {
      document.querySelectorAll('.nav-admin').forEach(el => {
        el.style.display = '';
      });
    }
  } catch (e) {}
})();
