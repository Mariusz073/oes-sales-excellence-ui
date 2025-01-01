-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPrivileges" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "individualReports" BOOLEAN NOT NULL DEFAULT false,
    "teamMonash" BOOLEAN NOT NULL DEFAULT false,
    "teamSOL" BOOLEAN NOT NULL DEFAULT false,
    "teamBehavioural" BOOLEAN NOT NULL DEFAULT false,
    "teamCollaborative" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserPrivileges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserReportPermission" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "reportFilename" TEXT NOT NULL,

    CONSTRAINT "UserReportPermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "UserPrivileges_userId_key" ON "UserPrivileges"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserReportPermission_userId_reportFilename_key" ON "UserReportPermission"("userId", "reportFilename");

-- AddForeignKey
ALTER TABLE "UserPrivileges" ADD CONSTRAINT "UserPrivileges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserReportPermission" ADD CONSTRAINT "UserReportPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
