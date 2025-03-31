import { db } from '.';
import { users, visits } from './schema';
import { sql } from '@vercel/postgres';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// Tipos
export type User = {
  id: number;
  username: string;
  password?: string;
  name: string;
  createdAt: Date;
};

export type Visit = {
  id: number;
  userId: number;
  username: string;
  userName: string;
  timestamp: Date;
};

// Obtener usuario por nombre de usuario
export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error(`Error al buscar usuario ${username}:`, error);
    return null;
  }
}

// Obtener usuario por ID
export async function getUserById(id: number): Promise<User | null> {
  try {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error(`Error al buscar usuario por ID ${id}:`, error);
    return null;
  }
}

// Validar usuario (login)
export async function validateUser(username: string, password: string): Promise<Omit<User, 'password'> | null> {
  try {
    const user = await getUserByUsername(username);
    if (!user || !user.password) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;
    
    // Registrar la visita
    await recordVisit(user.id, user.username, user.name);
    
    // No devolver la contraseña
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error(`Error al validar usuario ${username}:`, error);
    return null;
  }
}

// Crear nuevo usuario
export async function createUser(username: string, password: string, name: string): Promise<Omit<User, 'password'>> {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await db.insert(users).values({
      username,
      password: hashedPassword,
      name
    }).returning();
    
    const newUser = result[0];
    
    // No devolver la contraseña
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw new Error('No se pudo crear el usuario');
  }
}

// Actualizar usuario
export async function updateUser(
  id: number, 
  data: { username?: string; password?: string; name?: string }
): Promise<Omit<User, 'password'>> {
  try {
    const updateData: any = {};
    
    if (data.username) updateData.username = data.username;
    if (data.name) updateData.name = data.name;
    if (data.password) updateData.password = await bcrypt.hash(data.password, 10);
    
    const result = await db.update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    
    // No devolver la contraseña
    const { password: _, ...userWithoutPassword } = result[0];
    return userWithoutPassword;
  } catch (error) {
    console.error(`Error al actualizar usuario con ID ${id}:`, error);
    throw new Error('No se pudo actualizar el usuario');
  }
}

// Eliminar usuario
export async function deleteUser(id: number): Promise<void> {
  try {
    await db.delete(users).where(eq(users.id, id));
  } catch (error) {
    console.error(`Error al eliminar usuario con ID ${id}:`, error);
    throw new Error('No se pudo eliminar el usuario');
  }
}

// Registrar visita
export async function recordVisit(userId: number, username: string, userName: string): Promise<void> {
  try {
    await db.insert(visits).values({
      userId,
      username,
      userName
    });
  } catch (error) {
    console.error(`Error al registrar visita para usuario ${username}:`, error);
  }
}

// Obtener todas las visitas
export async function getAllVisits(): Promise<Visit[]> {
  try {
    // Ordenar por timestamp descendente (más recientes primero)
    return await db.select().from(visits).orderBy(visits.timestamp);
  } catch (error) {
    console.error('Error al obtener todas las visitas:', error);
    return [];
  }
}

// Obtener visitas por usuario
export async function getVisitsByUser(userId: number): Promise<Visit[]> {
  try {
    return await db.select().from(visits).where(eq(visits.userId, userId));
  } catch (error) {
    console.error(`Error al obtener visitas del usuario ${userId}:`, error);
    return [];
  }
}

// Obtener todos los usuarios (sin contraseñas)
export async function getAllUsers(): Promise<Omit<User, 'password'>[]> {
  try {
    const allUsers = await db.select().from(users);
    return allUsers.map(({ password, ...user }) => user);
  } catch (error) {
    console.error('Error al obtener todos los usuarios:', error);
    return [];
  }
} 