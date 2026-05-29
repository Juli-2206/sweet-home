// Muestra los links restringidos (.nav-admin) y oculta el acceso admin (.nav-login-link)
// si hay sesión activa con rol admin o negocios
(function () {
  try {
    const usuario = JSON.parse(sessionStorage.getItem('sh_usuario'));
    if (usuario && (usuario.rol === 'admin' || usuario.rol === 'negocios')) {
      document.querySelectorAll('.nav-admin').forEach(el => el.style.display = '');
      document.querySelectorAll('.nav-login-link').forEach(el => el.style.display = 'none');
    }
  } catch (e) {}
})();
