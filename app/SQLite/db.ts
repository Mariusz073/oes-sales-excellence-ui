import Database from 'better-sqlite3';
import { join } from 'path';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const dbPath = join(process.cwd(), 'app/SQLite/users.db');
const db = new Database(dbPath);

// Initialize users table and privileges
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    isAdmin INTEGER NOT NULL DEFAULT 0,
    resetToken TEXT,
    resetTokenExpiry DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_privileges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    individualReports INTEGER NOT NULL DEFAULT 0,
    teamMonash INTEGER NOT NULL DEFAULT 0,
    teamSOL INTEGER NOT NULL DEFAULT 0,
    teamBehavioural INTEGER NOT NULL DEFAULT 0,
    teamCollaborative INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (userId) REFERENCES users(id)
  );
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

interface UserPrivileges {
  individualReports: boolean;
  teamMonash: boolean;
  teamSOL: boolean;
  teamBehavioural: boolean;
  teamCollaborative: boolean;
}

interface DbUserPrivileges {
  individualReports: number;
  teamMonash: number;
  teamSOL: number;
  teamBehavioural: number;
  teamCollaborative: number;
}

// Create initial admin user if not exists
const createInitialAdmin = () => {
  const adminExists = db.prepare('SELECT 1 FROM users WHERE username = ?').get('oes-admin');
  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('admin', 10);
    
    // Use transaction to create admin user with privileges
    const transaction = db.transaction(() => {
      // Create admin user
      const result = db.prepare('INSERT INTO users (username, password, isAdmin) VALUES (?, ?, ?)').run('oes-admin', hashedPassword, 1);
      const userId = result.lastInsertRowid;

      // Create admin privileges
      db.prepare(`
        INSERT INTO user_privileges (
          userId, 
          individualReports, 
          teamMonash, 
          teamSOL, 
          teamBehavioural, 
          teamCollaborative
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).run(userId, 1, 1, 1, 1, 1);
    });

    transaction();
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

  createUser: (username: string, password: string, isAdmin: boolean = false, privileges: UserPrivileges) => {
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    // Use a transaction to ensure both user and privileges are created
    const transaction = db.transaction((username: string, password: string, isAdmin: boolean, privileges: UserPrivileges) => {
      try {
        // Create user
        const userResult = db.prepare('INSERT INTO users (username, password, isAdmin) VALUES (?, ?, ?)').run(username, password, isAdmin ? 1 : 0);
        const userId = userResult.lastInsertRowid;

        // Create privileges
        db.prepare(`
          INSERT INTO user_privileges (
            userId, 
            individualReports, 
            teamMonash, 
            teamSOL, 
            teamBehavioural, 
            teamCollaborative
          ) VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          userId,
          privileges.individualReports ? 1 : 0,
          privileges.teamMonash ? 1 : 0,
          privileges.teamSOL ? 1 : 0,
          privileges.teamBehavioural ? 1 : 0,
          privileges.teamCollaborative ? 1 : 0
        );

        return userId;
      } catch (error) {
        if ((error as any).code === 'SQLITE_CONSTRAINT_UNIQUE') {
          throw new Error('Username already exists');
        }
        throw error;
      }
    });

    return transaction(username, hashedPassword, isAdmin, privileges);
  },

  getUserPrivileges: (userId: number): UserPrivileges => {
    const privileges = db.prepare(`
      SELECT 
        individualReports, 
        teamMonash, 
        teamSOL, 
        teamBehavioural, 
        teamCollaborative 
      FROM user_privileges 
      WHERE userId = ?
    `).get(userId) as DbUserPrivileges | undefined;

    if (!privileges) {
      // If no privileges found, create default privileges (all false)
      const defaultPrivileges = {
        individualReports: false,
        teamMonash: false,
        teamSOL: false,
        teamBehavioural: false,
        teamCollaborative: false
      };

      // Insert default privileges
      db.prepare(`
        INSERT INTO user_privileges (
          userId, 
          individualReports, 
          teamMonash, 
          teamSOL, 
          teamBehavioural, 
          teamCollaborative
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).run(userId, 0, 0, 0, 0, 0);

      return defaultPrivileges;
    }

    return {
      individualReports: Boolean(privileges.individualReports),
      teamMonash: Boolean(privileges.teamMonash),
      teamSOL: Boolean(privileges.teamSOL),
      teamBehavioural: Boolean(privileges.teamBehavioural),
      teamCollaborative: Boolean(privileges.teamCollaborative)
    };
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
  },

  updateUserPrivileges: (userId: number, isAdmin: boolean, privileges: UserPrivileges) => {
    const transaction = db.transaction((userId: number, isAdmin: boolean, privileges: UserPrivileges) => {
      // Update user admin status
      db.prepare('UPDATE users SET isAdmin = ? WHERE id = ?').run(isAdmin ? 1 : 0, userId);

      // Update privileges
      db.prepare(`
        UPDATE user_privileges SET
          individualReports = ?,
          teamMonash = ?,
          teamSOL = ?,
          teamBehavioural = ?,
          teamCollaborative = ?
        WHERE userId = ?
      `).run(
        privileges.individualReports ? 1 : 0,
        privileges.teamMonash ? 1 : 0,
        privileges.teamSOL ? 1 : 0,
        privileges.teamBehavioural ? 1 : 0,
        privileges.teamCollaborative ? 1 : 0,
        userId
      );
    });

    return transaction(userId, isAdmin, privileges);
  },

  resetUserPassword: (userId: number) => {
    const password = crypto.randomBytes(6).toString('hex');
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, userId);
    
    return password;
  },

  deleteUser: (userId: number) => {
    const transaction = db.transaction((userId: number) => {
      // Delete user privileges first due to foreign key constraint
      db.prepare('DELETE FROM user_privileges WHERE userId = ?').run(userId);
      // Delete user
      db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    });

    return transaction(userId);
  }
};

export default db;
