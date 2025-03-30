// Script para manejar las notificaciones
document.addEventListener('DOMContentLoaded', function() {
  // Función para actualizar la notificación en la página
  function updateNotificationDisplay() {
    try {
      const container = document.getElementById('notification-container');
      if (!container) return;
      
      // Intentar obtener la notificación del localStorage
      const storedNotification = localStorage.getItem('important_notification');
      
      // Limpiar el contenedor
      container.innerHTML = '';
      
      if (storedNotification) {
        const data = JSON.parse(storedNotification);
        if (data && data.message) {
          // Crear la notificación
          container.innerHTML = `
            <div class="bg-red-600 text-white p-4 mb-6 rounded-md shadow-md border-2 border-red-800">
              <div class="container mx-auto flex items-center">
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
            </div>
          `;
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
    if (e.key === 'important_notification') {
      updateNotificationDisplay();
    }
  });
  
  // Comprobar periódicamente si hay cambios en la notificación (cada 5 segundos)
  setInterval(updateNotificationDisplay, 5000);
}); 