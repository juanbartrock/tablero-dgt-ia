// Este archivo se ejecuta solo en el servidor
import { query } from '../postgres'; // Importar la función de consulta PostgreSQL
import bcrypt from 'bcryptjs'; // Necesitamos bcrypt para hashear al crear/actualizar

// Interfaces (pueden mantenerse o moverse a types.ts si se usan en más sitios)
interface User {
  id: number;
  username: string;
  password?: string; // La contraseña ahora es opcional al devolver el usuario
  name: string | null; // Ajustado a NULLABLE en DB
  created_at?: Date; // Añadido desde la DB
}

interface Visit {
  id: number;
  user_id: number | null; // Ajustado a NULLABLE en DB
  username: string;
  user_name: string | null; // Ajustado a NULLABLE en DB
  timestamp: string | Date; // Ajustado a TIMESTAMPTZ en DB
}

// Ya no necesitamos la clase AuthDB ni manejar archivos JSON
// Las funciones serán exportadas directamente

export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    const result = await query('SELECT id, username, password, name, created_at FROM users WHERE username = $1', [username]);
    if (result.rows.length > 0) {
      // Devolvemos el usuario incluyendo la contraseña para validación interna
      return result.rows[0] as User;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user by username:', error);
    throw error; // O manejar el error de forma más específica
  }
}

export async function getUserById(id: number): Promise<Omit<User, 'password'> | null> {
   try {
    // No seleccionamos la contraseña aquí
    const result = await query('SELECT id, username, name, created_at FROM users WHERE id = $1', [id]);
    if (result.rows.length > 0) {
      return result.rows[0] as Omit<User, 'password'>;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user by id:', error);
    throw error;
  }
}

export async function validateUser(username: string, password: string): Promise<Omit<User, 'password'> | null> {
  const user = await getUserByUsername(username);
  if (!user || !user.password) {
      // Si el usuario no existe o (por alguna razón) no tiene contraseña en la DB
      return null;
  }

  // --- ¡¡¡ADVERTENCIA DE SEGURIDAD!!! ---
  // La siguiente línea compara contraseñas en TEXTO PLANO.
  // Esto es TEMPORAL porque la contraseña 'admin123' se insertó sin hashear.
  // DEBE reemplazarse por bcrypt.compare TAN PRONTO como la contraseña en la DB esté hasheada.
  const isValid = password === user.password;
  // --- FIN DE LA ADVERTENCIA ---

  // --- CÓDIGO CORRECTO (usar cuando la contraseña esté hasheada): ---
  // const isValid = await bcrypt.compare(password, user.password);
  // --- FIN CÓDIGO CORRECTO ---

  if (!isValid) {
      return null;
  }

  // Registrar la visita (adaptaremos esta función más adelante)
  await recordVisit(user.id, user.username, user.name);

  // No devolver la contraseña
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function createUser(username: string, password: string, name: string): Promise<Omit<User, 'password'>> {
  // Hashear la contraseña ANTES de guardarla
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await query(
      'INSERT INTO users (username, password, name) VALUES ($1, $2, $3) RETURNING id, username, name, created_at',
      [username, hashedPassword, name]
    );
    if (result.rows.length > 0) {
      return result.rows[0] as Omit<User, 'password'>;
    }
    throw new Error('User creation failed.');
  } catch (error: any) {
    console.error('Error creating user:', error);
    // Podrías querer manejar errores específicos como 'username already exists'
    if (error.code === '23505') { // Código de error de PostgreSQL para violación de unicidad
        throw new Error('Username already exists.');
    }
    throw error;
  }
}

export async function updateUser(id: number, username: string, password: string | null, name: string): Promise<Omit<User, 'password'>> {
  let updateQuery: string;
  let queryParams: any[];

  if (password) {
    // Si se proporciona contraseña, hashearla y actualizarla
    const hashedPassword = await bcrypt.hash(password, 10);
    updateQuery = 'UPDATE users SET username = $1, password = $2, name = $3 WHERE id = $4 RETURNING id, username, name, created_at';
    queryParams = [username, hashedPassword, name, id];
  } else {
    // Si no se proporciona contraseña, actualizar solo username y name
    updateQuery = 'UPDATE users SET username = $1, name = $2 WHERE id = $3 RETURNING id, username, name, created_at';
    queryParams = [username, name, id];
  }

  try {
    const result = await query(updateQuery, queryParams);
    if (result.rows.length > 0) {
      return result.rows[0] as Omit<User, 'password'>;
    }
    throw new Error('User not found or update failed.');
  } catch (error: any) {
    console.error('Error updating user:', error);
    if (error.code === '23505') {
        throw new Error('Username already exists.');
    }
    throw error;
  }
}

export async function deleteUser(id: number): Promise<void> {
  try {
    const result = await query('DELETE FROM users WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      console.warn(`User with ID ${id} not found for deletion.`);
      // Considera si lanzar un error es más apropiado
      // throw new Error('User not found.');
    }
    // No se devuelve nada en caso de éxito
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// --- Funciones de Visitas (A adaptar más adelante) ---
// Por ahora, dejaremos las funciones de visita comentadas o
// con una implementación placeholder para evitar errores,
// ya que dependen de la tabla 'visits' que también necesita refactorización.

export async function recordVisit(userId: number, username: string, userName: string | null): Promise<void> {
  console.log(`TODO: Implement recordVisit in PostgreSQL for user ID: ${userId}`);
   try {
       await query(
         'INSERT INTO visits (user_id, username, user_name) VALUES ($1, $2, $3)',
         [userId, username, userName]
       );
       console.log(`Visit recorded for user ${username} (ID: ${userId})`);
     } catch (error) {
       console.error('Error recording visit:', error);
       // No relanzar el error aquí para no bloquear el login si falla la visita
     }
}

export async function getAllVisits(): Promise<Visit[]> {
  console.log('TODO: Implement getAllVisits in PostgreSQL');
  // Placeholder: devuelve un array vacío por ahora
  // return [];
  try {
    const result = await query('SELECT id, user_id, username, user_name, timestamp FROM visits ORDER BY timestamp DESC');
    return result.rows as Visit[];
  } catch (error) {
    console.error('Error fetching visits:', error);
    return []; // Devolver vacío en caso de error
  }
}
// --- Fin Funciones de Visitas ---

export async function getUsersWithoutPasswords(): Promise<Omit<User, 'password'>[]> {
  try {
    // Seleccionar todos los usuarios sin su contraseña
    const result = await query('SELECT id, username, name, created_at FROM users ORDER BY username');
    return result.rows as Omit<User, 'password'>[];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

// Ya no necesitamos exportar una instancia de clase
// export const authDb = new AuthDB(); // Eliminar esta línea 