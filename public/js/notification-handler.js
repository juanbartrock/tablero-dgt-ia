// Script para manejar las notificaciones
document.addEventListener('DOMContentLoaded', function() {
  // Función para actualizar la notificación en la página
  async function updateNotificationDisplay() {
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
      
      // Obtener la notificación activa desde la API
      let response;
      try {
        response = await fetch('/api/notifications', {
          credentials: 'include'
        });
      } catch (error) {
        console.error('Error de red al obtener notificación:', error);
        return;
      }
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('Usuario no autenticado');
          return;
        }
        console.error('Error al obtener notificación:', await response.text());
        return;
      }
      
      const data = await response.json();
      
      // Limpiar el contenedor
      container.innerHTML = '';
      
      if (data.notification) {
        const notification = data.notification;
        
        // Usar hasBeenViewed del endpoint
        const isViewed = notification.hasBeenViewed;
        
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
                <div class="font-bold text-lg">${notification.message}</div>
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
          markAsViewedBtn.addEventListener('click', async function() {
            try {
              const response = await fetch('/api/notifications', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ notificationId: notification.id }),
                credentials: 'include'
              });
              
              if (!response.ok) {
                const errorText = await response.text();
                console.error('Error al marcar como vista:', errorText);
                return;
              }
              
              // Actualizar la interfaz
              updateNotificationDisplay();
            } catch (error) {
              console.error('Error de red al marcar notificación como vista:', error);
            }
          });
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
  
  // Comprobar periódicamente si hay cambios en la notificación (cada 5 segundos)
  setInterval(updateNotificationDisplay, 5000);
}); 