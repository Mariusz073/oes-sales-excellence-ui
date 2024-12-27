import Database from 'better-sqlite3';
import { join } from 'path';
import bcrypt from 'bcrypt';

const dbPath = join(process.cwd(), 'app/SQLite/users.db');
const db = new Database(dbPath);

// Initialize users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    isAdmin INTEGER NOT NULL DEFAULT 0,
    resetToken TEXT,
    resetTokenExpiry DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

interface DbUser {
  id: number;
  username: string;
  password: string;
  isAdmin: number;
  resetToken: string | null;
  resetTokenExpiry: string | null;
  createdAt: string;
}

// Create initial admin user if not exists
const createInitialAdmin = () => {
  const adminExists = db.prepare('SELECT 1 FROM users WHERE username = ?').get('oes-admin');
  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('admin', 10);
    db.prepare('INSERT INTO users (username, password, isAdmin) VALUES (?, ?, ?)').run('oes-admin', hashedPassword, 1);
  }
};

createInitialAdmin();

// User type definition
export interface User {
  id: number;
  username: string;
  isAdmin: boolean;
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;
}

// Database operations
export const dbOperations = {
  getUserByUsername: (username: string) => {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as DbUser | undefined;
    if (user) {
      return {
        ...user,
        isAdmin: Boolean(user.isAdmin),
        resetTokenExpiry: user.resetTokenExpiry ? new Date(user.resetTokenExpiry) : null
      } as User;
    }
    return undefined;
  },

  getUserById: (id: number) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as DbUser | undefined;
    if (user) {
      return {
        ...user,
        isAdmin: Boolean(user.isAdmin),
        resetTokenExpiry: user.resetTokenExpiry ? new Date(user.resetTokenExpiry) : null
      } as User;
    }
    return undefined;
  },

  createUser: (username: string, password: string, isAdmin: boolean = false) => {
    const hashedPassword = bcrypt.hashSync(password, 10);
    try {
      const result = db.prepare('INSERT INTO users (username, password, isAdmin) VALUES (?, ?, ?)').run(username, hashedPassword, isAdmin ? 1 : 0);
      return result.lastInsertRowid;
    } catch (error) {
      if ((error as any).code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error('Username already exists');
      }
      throw error;
    }
  },

  verifyPassword: (user: User, password: string) => {
    const dbUser = db.prepare('SELECT password FROM users WHERE id = ?').get(user.id) as { password: string };
    return bcrypt.compareSync(password, dbUser.password);
  },

  updateResetToken: (username: string, token: string | null, expiry: Date | null) => {
    return db.prepare('UPDATE users SET resetToken = ?, resetTokenExpiry = ? WHERE username = ?').run(token, expiry?.toISOString(), username);
  },

  getUserByResetToken: (token: string) => {
    const user = db.prepare('SELECT * FROM users WHERE resetToken = ? AND resetTokenExpiry > datetime("now")').get(token) as DbUser | undefined;
    if (user) {
      return {
        ...user,
        isAdmin: Boolean(user.isAdmin),
        resetTokenExpiry: user.resetTokenExpiry ? new Date(user.resetTokenExpiry) : null
      } as User;
    }
    return undefined;
  },

  updatePassword: (userId: number, newPassword: string) => {
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    return db.prepare('UPDATE users SET password = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE id = ?').run(hashedPassword, userId);
  },

  getAllUsers: () => {
    const users = db.prepare('SELECT id, username, isAdmin, createdAt FROM users').all() as DbUser[];
    return users.map(user => ({
      ...user,
      isAdmin: Boolean(user.isAdmin),
      resetTokenExpiry: user.resetTokenExpiry ? new Date(user.resetTokenExpiry) : null
    })) as User[];
  }
};

export default db;
