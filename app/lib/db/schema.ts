import { pgTable, serial, text, timestamp, integer, boolean, varchar, json } from 'drizzle-orm/pg-core';

// Tabla de usuarios
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password: text('password').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Tabla de tareas
export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  description: text('description').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('Pendiente'),
  responsible: varchar('responsible', { length: 100 }),
  linkedAreas: json('linked_areas').$type<string[]>(),
  importantDate: varchar('important_date', { length: 50 }),
  priority: varchar('priority', { length: 20 }).notNull().default('Media'),
  highlighted: boolean('highlighted').default(false),
  comment: text('comment'),
  fileUrl: varchar('file_url', { length: 255 }),
  fileName: varchar('file_name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Tabla de comentarios históricos de tareas
export const taskComments = pgTable('task_comments', {
  id: serial('id').primaryKey(),
  taskId: integer('task_id').notNull(),
  comment: text('comment').notNull(),
  createdBy: varchar('created_by', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Tabla de visitas
export const visits = pgTable('visits', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  username: varchar('username', { length: 50 }).notNull(),
  userName: varchar('user_name', { length: 100 }).notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull()
});

// Tabla de notificaciones
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  message: text('message').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  created_by_id: integer('created_by_id').notNull(),
  created_by_name: varchar('created_by_name', { length: 100 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('active')
});

// Tabla para seguimiento de visualizaciones de notificaciones
export const notificationViews = pgTable('notification_views', {
  id: serial('id').primaryKey(),
  notification_id: integer('notification_id').notNull(),
  user_id: integer('user_id').notNull(),
  viewed_at: timestamp('viewed_at').defaultNow().notNull()
}); 