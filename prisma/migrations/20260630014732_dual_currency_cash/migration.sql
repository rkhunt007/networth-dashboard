-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CashBalance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "amount" REAL NOT NULL DEFAULT 0,
    "amountUsd" REAL NOT NULL DEFAULT 0,
    "accountId" INTEGER NOT NULL,
    CONSTRAINT "CashBalance_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CashBalance" ("accountId", "amount", "id") SELECT "accountId", "amount", "id" FROM "CashBalance";
DROP TABLE "CashBalance";
ALTER TABLE "new_CashBalance" RENAME TO "CashBalance";
CREATE UNIQUE INDEX "CashBalance_accountId_key" ON "CashBalance"("accountId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
