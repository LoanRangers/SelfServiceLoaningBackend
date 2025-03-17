-- CreateTable
CREATE TABLE "Users" (
    "ssoId" TEXT NOT NULL,
    "ssoName" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("ssoId")
);

-- CreateTable
CREATE TABLE "Items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "categoryName" TEXT,
    "markers" JSONB,

    CONSTRAINT "Items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoanedItems" (
    "loanId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "loanedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locationName" TEXT NOT NULL,

    CONSTRAINT "LoanedItems_pkey" PRIMARY KEY ("loanId")
);

-- CreateTable
CREATE TABLE "LoanedItemsHistory" (
    "loanId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "loanedDate" TIMESTAMP(3) NOT NULL,
    "returnedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locationName" TEXT NOT NULL,

    CONSTRAINT "LoanedItemsHistory_pkey" PRIMARY KEY ("loanId")
);

-- CreateTable
CREATE TABLE "Locations" (
    "name" TEXT NOT NULL,

    CONSTRAINT "Locations_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "Categories" (
    "name" TEXT NOT NULL,

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "FlagsOnItems" (
    "flagId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "flagName" TEXT NOT NULL,

    CONSTRAINT "FlagsOnItems_pkey" PRIMARY KEY ("flagId")
);

-- CreateTable
CREATE TABLE "Flags" (
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Flags_pkey" PRIMARY KEY ("name")
);

-- CreateIndex
CREATE UNIQUE INDEX "LoanedItems_itemId_key" ON "LoanedItems"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "Locations_name_key" ON "Locations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Flags_name_key" ON "Flags"("name");

-- AddForeignKey
ALTER TABLE "Items" ADD CONSTRAINT "Items_categoryName_fkey" FOREIGN KEY ("categoryName") REFERENCES "Categories"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanedItems" ADD CONSTRAINT "LoanedItems_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("ssoId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanedItems" ADD CONSTRAINT "LoanedItems_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanedItems" ADD CONSTRAINT "LoanedItems_locationName_fkey" FOREIGN KEY ("locationName") REFERENCES "Locations"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanedItemsHistory" ADD CONSTRAINT "LoanedItemsHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("ssoId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanedItemsHistory" ADD CONSTRAINT "LoanedItemsHistory_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanedItemsHistory" ADD CONSTRAINT "LoanedItemsHistory_locationName_fkey" FOREIGN KEY ("locationName") REFERENCES "Locations"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlagsOnItems" ADD CONSTRAINT "FlagsOnItems_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlagsOnItems" ADD CONSTRAINT "FlagsOnItems_flagName_fkey" FOREIGN KEY ("flagName") REFERENCES "Flags"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
