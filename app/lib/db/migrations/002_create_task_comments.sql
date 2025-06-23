-- Crear tabla para comentarios históricos de tareas
CREATE TABLE IF NOT EXISTS task_comments (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL,
    comment TEXT NOT NULL,
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Crear índice para optimizar consultas por task_id
CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);

-- Crear índice para ordenar por fecha
CREATE INDEX idx_task_comments_created_at ON task_comments(created_at DESC); 