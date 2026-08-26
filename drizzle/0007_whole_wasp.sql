CREATE TYPE "public"."recurring_status" AS ENUM('active', 'paused', 'finished');--> statement-breakpoint
ALTER TABLE "recurring_transactions" ALTER COLUMN "amount" SET DATA TYPE numeric(15, 2);--> statement-breakpoint
ALTER TABLE "recurring_transactions" ALTER COLUMN "source_account_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "recurring_transactions" ALTER COLUMN "category_account_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "recurring_transactions" ADD COLUMN "entry_type" "entry_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "recurring_transactions" ADD COLUMN "last_run_date" date;--> statement-breakpoint
ALTER TABLE "recurring_transactions" ADD COLUMN "status" "recurring_status" NOT NULL;--> statement-breakpoint
ALTER TABLE "recurring_transactions" ADD COLUMN "created_by" char(26);--> statement-breakpoint
ALTER TABLE "recurring_transactions" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "recurring_transactions" ADD COLUMN "updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "recurring_transactions" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "recurring_transaction_id" char(26);--> statement-breakpoint
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_recurring_transaction_id_recurring_transactions_id_fk" FOREIGN KEY ("recurring_transaction_id") REFERENCES "public"."recurring_transactions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_transactions_recurring_date" ON "transactions" USING btree ("recurring_transaction_id","date") WHERE "transactions"."recurring_transaction_id" IS NOT NULL;