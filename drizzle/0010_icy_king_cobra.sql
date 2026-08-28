CREATE TYPE "public"."recurring_status" AS ENUM('active', 'paused', 'finished');--> statement-breakpoint
CREATE TABLE "tags" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"company_id" char(26) NOT NULL,
	"name" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "transaction_tags" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"transaction_id" char(26) NOT NULL,
	"tag_id" char(26) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "ledger_entries" RENAME COLUMN "entryType" TO "entry_type";--> statement-breakpoint
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
ALTER TABLE "tags" ADD CONSTRAINT "tags_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_tags" ADD CONSTRAINT "transaction_tags_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_tags" ADD CONSTRAINT "transaction_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_tags_company_name" ON "tags" USING btree ("company_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_transaction_tags_link" ON "transaction_tags" USING btree ("transaction_id","tag_id");--> statement-breakpoint
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_recurring_transaction_id_recurring_transactions_id_fk" FOREIGN KEY ("recurring_transaction_id") REFERENCES "public"."recurring_transactions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_transactions_recurring_date" ON "transactions" USING btree ("recurring_transaction_id","date") WHERE "transactions"."recurring_transaction_id" IS NOT NULL;