ALTER TABLE "ledger_entries" ALTER COLUMN "account_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "company_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "value" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "entryType" "entry_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "amount" integer NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_accounts_company_value" ON "accounts" USING btree ("company_id","value");