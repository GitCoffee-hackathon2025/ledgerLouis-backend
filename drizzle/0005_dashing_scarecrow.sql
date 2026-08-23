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
ALTER TABLE "tags" ADD CONSTRAINT "tags_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_tags" ADD CONSTRAINT "transaction_tags_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_tags" ADD CONSTRAINT "transaction_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_tags_company_name" ON "tags" USING btree ("company_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_transaction_tags_link" ON "transaction_tags" USING btree ("transaction_id","tag_id");