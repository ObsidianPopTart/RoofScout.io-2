-- Allow OAuth-only accounts (Google/Apple sign-in), which have no password.
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;
