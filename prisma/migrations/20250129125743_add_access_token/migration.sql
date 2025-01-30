-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('PERSONAL', 'ORGANIZATION');

-- CreateTable
CREATE TABLE "access_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "token_type" "TokenType" NOT NULL,
    "user_id" TEXT NOT NULL,
    "org_id" TEXT,
    "org_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "access_tokens_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "access_tokens" ADD CONSTRAINT "access_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
