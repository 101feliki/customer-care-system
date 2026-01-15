-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "bulkListId" TEXT;

-- AlterTable
ALTER TABLE "Recipient" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';

-- CreateTable
CREATE TABLE "BulkList" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "filename" TEXT,
    "totalRecipients" INTEGER NOT NULL DEFAULT 0,
    "processedRecipients" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "userId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BulkList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BulkNotificationJob" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "templateId" TEXT NOT NULL,
    "bulkListId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "totalRecipients" INTEGER NOT NULL DEFAULT 0,
    "processedRecipients" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "variables" JSONB,
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BulkNotificationJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BulkListRecipients" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BulkListRecipients_AB_unique" ON "_BulkListRecipients"("A", "B");

-- CreateIndex
CREATE INDEX "_BulkListRecipients_B_index" ON "_BulkListRecipients"("B");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_bulkListId_fkey" FOREIGN KEY ("bulkListId") REFERENCES "BulkList"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkList" ADD CONSTRAINT "BulkList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkNotificationJob" ADD CONSTRAINT "BulkNotificationJob_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "EmailTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkNotificationJob" ADD CONSTRAINT "BulkNotificationJob_bulkListId_fkey" FOREIGN KEY ("bulkListId") REFERENCES "BulkList"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkNotificationJob" ADD CONSTRAINT "BulkNotificationJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BulkListRecipients" ADD CONSTRAINT "_BulkListRecipients_A_fkey" FOREIGN KEY ("A") REFERENCES "BulkList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BulkListRecipients" ADD CONSTRAINT "_BulkListRecipients_B_fkey" FOREIGN KEY ("B") REFERENCES "Recipient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
