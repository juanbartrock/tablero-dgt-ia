// Este archivo se ejecuta solo en el servidor
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

// Utilizar una implementación simple de almacenamiento para modo desarrollo
// En producción, deberías usar una base de datos real como SQLite, PostgreSQL, etc.
interface User {
  id: number;
  username: string;
  password: string;
  name: string;
}

interface Visit {
  id: number;
  userId: number;
  username: string;
  timestamp: string;
  userName: string;
}

class AuthDB {
  private users: User[] = [];
  private visits: Visit[] = [];
  private dbPath: string;
  private visitsPath: string;
  private initialized: boolean = false;
  
  constructor() {
    // Guardar en public para que persista en Docker
    this.dbPath = path.join(process.cwd(), 'public', 'data', 'users.json');
    this.visitsPath = path.join(process.cwd(), 'public', 'data', 'visits.json');
    this.initDb();
  }
  
  private initDb() {
    if (this.initialized) return;
    
    try {
      // Asegurar que el directorio data exista
      const dataDir = path.join(process.cwd(), 'public', 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      // Verificar si el archivo de usuarios existe
      if (fs.existsSync(this.dbPath)) {
        const data = fs.readFileSync(this.dbPath, 'utf-8');
        this.users = JSON.parse(data);
      } else {
        // Crear un usuario admin por defecto
        const adminPassword = bcrypt.hashSync('admin123', 10);
        this.users = [
          {
            id: 1,
            username: 'admin',
            password: adminPassword,
            name: 'Administrador'
          }
        ];
        fs.writeFileSync(this.dbPath, JSON.stringify(this.users, null, 2));
      }
      
      // Verificar si el archivo de visitas existe
      if (fs.existsSync(this.visitsPath)) {
        const data = fs.readFileSync(this.visitsPath, 'utf-8');
        this.visits = JSON.parse(data);
      } else {
        this.visits = [];
        fs.writeFileSync(this.visitsPath, JSON.stringify(this.visits, null, 2));
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('Error al inicializar la base de datos:', error);
    }
  }
  
  async getUserByUsername(username: string): Promise<User | null> {
    this.initDb();
    const user = this.users.find(u => u.username === username);
    return user || null;
  }
  
  async getUserById(id: number): Promise<User | null> {
    this.initDb();
    const user = this.users.find(u => u.id === id);
    return user || null;
  }
  
  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;
    
    // Registrar la visita
    await this.recordVisit(user.id, user.username, user.name);
    
    // No devolver la contraseña
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }
  
  async createUser(username: string, password: string, name: string): Promise<User> {
    this.initDb();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newId = this.users.length > 0 
      ? Math.max(...this.users.map(u => u.id)) + 1 
      : 1;
    
    const newUser: User = {
      id: newId,
      username,
      password: hashedPassword,
      name
    };
    
    this.users.push(newUser);
    fs.writeFileSync(this.dbPath, JSON.stringify(this.users, null, 2));
    
    // No devolver la contraseña
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword as User;
  }
  
  async updateUser(id: number, username: string, password: string | null, name: string): Promise<User> {
    this.initDb();
    
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }
    
    // Actualizar solo los campos proporcionados
    const currentUser = this.users[userIndex];
    const updatedUser: User = {
      ...currentUser,
      username,
      name
    };
    
    // Actualizar la contraseña solo si se proporciona una nueva
    if (password) {
      updatedUser.password = await bcrypt.hash(password, 10);
    }
    
    this.users[userIndex] = updatedUser;
    fs.writeFileSync(this.dbPath, JSON.stringify(this.users, null, 2));
    
    // No devolver la contraseña
    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword as User;
  }
  
  async deleteUser(id: number): Promise<void> {
    this.initDb();
    
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }
    
    // Eliminar el usuario
    this.users.splice(userIndex, 1);
    fs.writeFileSync(this.dbPath, JSON.stringify(this.users, null, 2));
  }
  
  async recordVisit(userId: number, username: string, userName: string): Promise<void> {
    this.initDb();
    
    const newId = this.visits.length > 0 
      ? Math.max(...this.visits.map(v => v.id)) + 1 
      : 1;
    
    const visit: Visit = {
      id: newId,
      userId,
      username,
      userName,
      timestamp: new Date().toISOString()
    };
    
    this.visits.push(visit);
    
    try {
      // Guardar en public/data para la aplicación
      fs.writeFileSync(this.visitsPath, JSON.stringify(this.visits, null, 2));
      
      // También guardar en /data para respaldo
      const dataPath = path.join(process.cwd(), 'data', 'visits.json');
      fs.writeFileSync(dataPath, JSON.stringify(this.visits, null, 2));
      
      console.log(`Nueva visita registrada para usuario ${username} (ID: ${userId})`);
    } catch (error) {
      console.error('Error al guardar la visita:', error);
    }
  }
  
  async getAllVisits(): Promise<Visit[]> {
    this.initDb();
    console.log('Leyendo visitas desde:', this.visitsPath);
    try {
      if (fs.existsSync(this.visitsPath)) {
        const data = fs.readFileSync(this.visitsPath, 'utf-8');
        const visits = JSON.parse(data);
        console.log('Total de visitas leídas del archivo:', visits.length);
        return [...visits].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      } else {
        console.log('Archivo de visitas no encontrado');
        return [];
      }
    } catch (error) {
      console.error('Error al leer el archivo de visitas:', error);
      return [];
    }
  }
  
  async getUsersWithoutPasswords(): Promise<Omit<User, 'password'>[]> {
    this.initDb();
    return this.users.map(({ password, ...rest }) => rest);
  }
}

export const authDb = new AuthDB(); 