-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS USERS (
    ID SERIAL PRIMARY KEY,
    USERNAME VARCHAR(255) UNIQUE NOT NULL,
    PASSWORD TEXT NOT NULL, -- Se guarda el hash de la contraseña
    NAME VARCHAR(255),
    CREATED_AT TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Tareas
CREATE TABLE IF NOT EXISTS TASKS (
    ID SERIAL PRIMARY KEY,
    DESCRIPTION TEXT NOT NULL,
    STATUS VARCHAR(50) NOT NULL DEFAULT 'Pendiente', -- Ej: Pendiente, En Progreso, Bloqueada, Terminada
    RESPONSIBLE VARCHAR(255),
    LINKED_AREAS TEXT[], -- Array de strings para áreas vinculadas
    IMPORTANT_DATE DATE,
    PRIORITY VARCHAR(50) DEFAULT 'Media', -- Ej: Baja, Media, Alta
    HIGHLIGHTED BOOLEAN DEFAULT FALSE,
    COMMENT TEXT,
    CREATED_AT TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UPDATED_AT TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para actualizar automáticamente updated_at en tasks
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_task_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Tabla de Visitas (Registro de inicios de sesión)
CREATE TABLE IF NOT EXISTS visits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Relación con usuarios (opcional si se elimina el usuario)
    username VARCHAR(255), -- Guardamos el username por si el usuario se borra
    user_name VARCHAR(255), -- Guardamos el nombre por si el usuario se borra
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Notificaciones (Ajusta según tus necesidades específicas)
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info', -- Ej: info, warning, error, success
    is_read BOOLEAN DEFAULT FALSE,
    recipient_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- A quién va dirigida (opcional, podría ser global)
    related_task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL, -- Tarea relacionada (opcional)
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Crear el usuario admin inicial si no existe
-- Nota: Ejecutar esto manualmente o en un script de inicialización, no directamente en cada arranque.
-- La contraseña 'admin123' debe ser hasheada antes de insertarla.
-- INSERT INTO users (username, password, name)
-- SELECT 'admin', <HASH_DE_ADMIN123>, 'Administrador'
-- WHERE NOT EXISTS (
--     SELECT 1 FROM users WHERE username = 'admin'
-- );