ALTER TABLE "transactions" ALTER COLUMN "amount" SET DATA TYPE numeric(15, 2);--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "date" date NOT NULL;