import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.POSTGRES_URL_NON_POOLING
    }
  }
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

interface UserPrivileges {
  individualReports: boolean;
  teamMonash: boolean;
  teamSOL: boolean;
  teamBehavioural: boolean;
  teamCollaborative: boolean;
  allowedReports?: string[];
}

export interface User {
  id: number;
  username: string;
  isAdmin: boolean;
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;
}

// Create initial admin user if not exists
const createInitialAdmin = async () => {
  const adminExists = await prisma.user.findUnique({
    where: { username: 'oes-admin' }
  });

  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('admin', 10);
    
    await prisma.user.create({
      data: {
        username: 'oes-admin',
        password: hashedPassword,
        isAdmin: true,
        privileges: {
          create: {
            individualReports: true,
            teamMonash: true,
            teamSOL: true,
            teamBehavioural: true,
            teamCollaborative: true
          }
        }
      }
    });
  }
};

createInitialAdmin().catch(console.error);

// Database operations
export const dbOperations = {
  getUserByUsername: async (username: string) => {
    const user = await prisma.user.findUnique({
      where: { username }
    });
    if (user) {
      return {
        ...user,
        resetTokenExpiry: user.resetTokenExpiry
      } as User;
    }
    return undefined;
  },

  getUserById: async (id: number) => {
    const user = await prisma.user.findUnique({
      where: { id }
    });
    if (user) {
      return {
        ...user,
        resetTokenExpiry: user.resetTokenExpiry
      } as User;
    }
    return undefined;
  },

  createUser: async (username: string, password: string, isAdmin: boolean = false, privileges: UserPrivileges) => {
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    try {
      const user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          isAdmin,
          privileges: {
            create: {
              individualReports: privileges.individualReports,
              teamMonash: privileges.teamMonash,
              teamSOL: privileges.teamSOL,
              teamBehavioural: privileges.teamBehavioural,
              teamCollaborative: privileges.teamCollaborative
            }
          }
        }
      });

      // Create individual report permissions if provided and not admin
      if (!isAdmin && !privileges.individualReports && privileges.allowedReports?.length) {
        await prisma.userReportPermission.createMany({
          data: privileges.allowedReports.map(reportFilename => ({
            userId: user.id,
            reportFilename
          }))
        });
      }

      return user.id;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error('Username already exists');
      }
      throw error;
    }
  },

  getUserPrivileges: async (userId: number): Promise<UserPrivileges> => {
    const privileges = await prisma.userPrivileges.findUnique({
      where: { userId }
    });

    if (!privileges) {
      // If no privileges found, create default privileges (all false)
      const defaultPrivileges = {
        individualReports: false,
        teamMonash: false,
        teamSOL: false,
        teamBehavioural: false,
        teamCollaborative: false,
        allowedReports: []
      };

      // Insert default privileges
      await prisma.userPrivileges.create({
        data: {
          userId,
          ...defaultPrivileges
        }
      });

      return defaultPrivileges;
    }

    // Get allowed reports if not admin and not all reports allowed
    const allowedReports = !privileges.individualReports ? 
      (await prisma.userReportPermission.findMany({
        where: { userId },
        select: { reportFilename: true }
      })).map(permission => permission.reportFilename) : 
      [];

    return {
      individualReports: privileges.individualReports,
      teamMonash: privileges.teamMonash,
      teamSOL: privileges.teamSOL,
      teamBehavioural: privileges.teamBehavioural,
      teamCollaborative: privileges.teamCollaborative,
      allowedReports
    };
  },

  updateUserReportPermissions: async (userId: number, reportFilenames: string[]) => {
    await prisma.$transaction([
      // Delete existing permissions
      prisma.userReportPermission.deleteMany({
        where: { userId }
      }),
      // Insert new permissions
      prisma.userReportPermission.createMany({
        data: reportFilenames.map(filename => ({
          userId,
          reportFilename: filename
        }))
      })
    ]);
  },

  verifyPassword: async (user: User, password: string) => {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { password: true }
    });
    return dbUser ? bcrypt.compareSync(password, dbUser.password) : false;
  },

  updateResetToken: async (username: string, token: string | null, expiry: Date | null) => {
    return prisma.user.update({
      where: { username },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry
      }
    });
  },

  getUserByResetToken: async (token: string) => {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    });
    
    if (user) {
      return {
        ...user,
        resetTokenExpiry: user.resetTokenExpiry
      } as User;
    }
    return undefined;
  },

  updatePassword: async (userId: number, newPassword: string) => {
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    return prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });
  },

  getAllUsers: async () => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        isAdmin: true,
        createdAt: true,
        resetTokenExpiry: true
      }
    });
    return users as User[];
  },

  updateUserPrivileges: async (userId: number, isAdmin: boolean, privileges: UserPrivileges) => {
    await prisma.$transaction(async (tx) => {
      // Update user admin status
      await tx.user.update({
        where: { id: userId },
        data: { isAdmin }
      });

      // Update privileges
      await tx.userPrivileges.upsert({
        where: { userId },
        create: {
          userId,
          individualReports: privileges.individualReports,
          teamMonash: privileges.teamMonash,
          teamSOL: privileges.teamSOL,
          teamBehavioural: privileges.teamBehavioural,
          teamCollaborative: privileges.teamCollaborative
        },
        update: {
          individualReports: privileges.individualReports,
          teamMonash: privileges.teamMonash,
          teamSOL: privileges.teamSOL,
          teamBehavioural: privileges.teamBehavioural,
          teamCollaborative: privileges.teamCollaborative
        }
      });

      // Update individual report permissions if provided and not admin
      if (!isAdmin && !privileges.individualReports && privileges.allowedReports) {
        await dbOperations.updateUserReportPermissions(userId, privileges.allowedReports);
      }
    });
  },

  resetUserPassword: async (userId: number) => {
    const password = crypto.randomBytes(6).toString('hex');
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
    
    return password;
  },

  deleteUser: async (userId: number) => {
    await prisma.user.delete({
      where: { id: userId }
    });
  }
};

export default prisma;
