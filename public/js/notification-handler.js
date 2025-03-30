// Script para manejar las notificaciones
document.addEventListener('DOMContentLoaded', function() {
  // Función para actualizar la notificación en la página
  function updateNotificationDisplay() {
    try {
      const container = document.getElementById('notification-container');
      if (!container) return;
      
      // No mostrar notificaciones en la página de login
      if (window.location.pathname.includes('/login')) {
        container.innerHTML = '';
        return;
      }
      
      // Verificar si React ya está mostrando la notificación (si existe un elemento con clase bg-red-600)
      const reactNotification = document.querySelector('div.bg-red-600.text-white.p-4.mb-6');
      if (reactNotification) {
        // Si React ya está mostrando la notificación, no hacer nada
        container.innerHTML = '';
        return;
      }
      
      // Intentar obtener la notificación del localStorage
      const storedNotification = localStorage.getItem('important_notification');
      
      // Limpiar el contenedor
      container.innerHTML = '';
      
      if (storedNotification) {
        const data = JSON.parse(storedNotification);
        if (data && data.message) {
          // Verificar si la notificación ya ha sido vista por el usuario actual
          const currentUser = localStorage.getItem('auth_user');
          let isViewed = false;
          let viewedNotifications = [];
          
          if (currentUser) {
            const user = JSON.parse(currentUser);
            // Obtener notificaciones vistas del localStorage
            const viewedData = localStorage.getItem('viewed_notifications');
            if (viewedData) {
              viewedNotifications = JSON.parse(viewedData);
              // Verificar si esta notificación ya fue vista por este usuario
              isViewed = viewedNotifications.some(item => 
                item.notificationId === data.timestamp && 
                item.userId === user.id
              );
            }
          }
          
          // Crear la notificación con botón para marcar como vista
          container.innerHTML = `
            <div class="bg-red-600 text-white p-4 mb-6 rounded-md shadow-md border-2 border-red-800">
              <div class="container mx-auto flex items-center justify-between">
                <div class="flex items-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    class="h-6 w-6 mr-2 flex-shrink-0" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path 
                      stroke-linecap="round" 
                      stroke-linejoin="round" 
                      stroke-width="2" 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                    />
                  </svg>
                  <div class="font-bold text-lg">${data.message}</div>
                </div>
                ${isViewed ? 
                  '<span class="text-xs bg-white text-red-600 px-2 py-1 rounded ml-2">Vista</span>' : 
                  '<button id="mark-as-viewed" class="bg-white text-red-600 px-3 py-1 rounded text-sm hover:bg-red-100">Marcar como vista</button>'
                }
              </div>
            </div>
          `;
          
          // Agregar event listener para el botón de marcar como vista
          const markAsViewedBtn = document.getElementById('mark-as-viewed');
          if (markAsViewedBtn) {
            markAsViewedBtn.addEventListener('click', function() {
              const currentUser = localStorage.getItem('auth_user');
              if (currentUser) {
                const user = JSON.parse(currentUser);
                
                // Obtener notificaciones vistas existentes
                let viewedNotifications = [];
                const viewedData = localStorage.getItem('viewed_notifications');
                if (viewedData) {
                  viewedNotifications = JSON.parse(viewedData);
                }
                
                // Agregar esta notificación a las vistas
                viewedNotifications.push({
                  userId: user.id,
                  username: user.username,
                  userName: user.name,
                  notificationId: data.timestamp,
                  notificationMessage: data.message,
                  viewedAt: new Date().toISOString()
                });
                
                // Guardar en localStorage
                localStorage.setItem('viewed_notifications', JSON.stringify(viewedNotifications));
                
                // Actualizar la interfaz
                updateNotificationDisplay();
              }
            });
          }
        }
      }
    } catch (e) {
      console.error("Error al mostrar la notificación:", e);
    }
  }

  // Definir la función global para que pueda ser llamada desde cualquier parte
  window.updateNotification = updateNotificationDisplay;

  // Actualizar la notificación al cargar la página
  updateNotificationDisplay();
  
  // Escuchar cambios en el localStorage (esto solo funciona entre ventanas/pestañas)
  window.addEventListener('storage', function(e) {
    if (e.key === 'important_notification' || e.key === 'viewed_notifications') {
      updateNotificationDisplay();
    }
  });
  
  // Comprobar periódicamente si hay cambios en la notificación (cada 5 segundos)
  setInterval(updateNotificationDisplay, 5000);
}); 