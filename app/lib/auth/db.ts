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

class AuthDB {
  private users: User[] = [];
  private dbPath: string;
  private initialized: boolean = false;
  
  constructor() {
    // Guardar en public para que persista en Docker
    this.dbPath = path.join(process.cwd(), 'public', 'data', 'users.json');
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
  
  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;
    
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
}

export const authDb = new AuthDB(); 