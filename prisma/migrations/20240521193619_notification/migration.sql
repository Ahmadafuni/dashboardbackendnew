-- CreateTable
CREATE TABLE "Notifications" (
    "Id" SERIAL NOT NULL,
    "Title" TEXT NOT NULL,
    "Description" TEXT NOT NULL,
    "URL" TEXT,
    "IsSeen" BOOLEAN NOT NULL DEFAULT false,
    "ToDepartmentId" INTEGER NOT NULL,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("Id")
);

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_ToDepartmentId_fkey" FOREIGN KEY ("ToDepartmentId") REFERENCES "Departments"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
