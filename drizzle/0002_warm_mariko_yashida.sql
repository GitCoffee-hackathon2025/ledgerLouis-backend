ALTER TABLE "accounts" ALTER COLUMN "value" SET DATA TYPE numeric(15, 2) USING "value"::numeric(15, 2);--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "value" DROP NOT NULL;