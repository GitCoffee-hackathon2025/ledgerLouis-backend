CREATE TYPE "public"."account_type" AS ENUM('asset', 'expense', 'revenue');--> statement-breakpoint
CREATE TYPE "public"."installment_status" AS ENUM('planned', 'paid', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."entry_type" AS ENUM('debit', 'credit');--> statement-breakpoint
CREATE TYPE "public"."frequency" AS ENUM('weekly', 'monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('owner', 'admin', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."guest_role" AS ENUM('admin', 'viewer');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"company_id" char(26) NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" "account_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "installments" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"transaction_id" char(26) NOT NULL,
	"amount" integer NOT NULL,
	"due_date" date NOT NULL,
	"status" "installment_status",
	"paid_at" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ledger_entries" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"company_id" char(26) NOT NULL,
	"transaction_id" char(26) NOT NULL,
	"account_id" char(26) NOT NULL,
	"entryType" "entry_type" NOT NULL,
	"amount" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "recurring_transactions" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"company_id" char(26) NOT NULL,
	"description" text,
	"amount" integer NOT NULL,
	"source_account_id" char(26) NOT NULL,
	"category_account_id" char(26) NOT NULL,
	"frequency" "frequency" NOT NULL,
	"interval_value" integer,
	"start_date" date NOT NULL,
	"end_date" date,
	"next_run_date" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"company_id" char(26) NOT NULL,
	"project_id" char(26),
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "jwt_keys" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"kid" char(26) NOT NULL,
	"public_key" text NOT NULL,
	"private_key" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"user_id" char(26) NOT NULL,
	"session_id" char(26) NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"revoked_at" timestamp,
	"replaced_by" char(26),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"user_id" char(26) NOT NULL,
	"revoked_at" timestamp,
	"last_activity_at" timestamp NOT NULL,
	"expires_at" timestamp NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"email" varchar(150) NOT NULL,
	"password" varchar(255) NOT NULL,
	"is_verified" timestamp,
	"avatar" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"cnpj" varchar(14) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "company_users" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"company_id" char(26) NOT NULL,
	"user_id" char(26) NOT NULL,
	"role" "role" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "invites" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"company_id" char(26) NOT NULL,
	"email" varchar(150) NOT NULL,
	"role" "guest_role" NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"accepted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"company_id" char(26) NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text,
	"start_date" date,
	"end_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"storage_name" varchar(255) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"provider" varchar(50) NOT NULL,
	"path" varchar(500) NOT NULL,
	"size" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_profile_images" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"user_id" varchar(26) NOT NULL,
	"file_id" varchar(26) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "user_profile_images_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "user_profile_images_file_id_unique" UNIQUE("file_id")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "installments" ADD CONSTRAINT "installments_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_source_account_id_accounts_id_fk" FOREIGN KEY ("source_account_id") REFERENCES "public"."accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_category_account_id_accounts_id_fk" FOREIGN KEY ("category_account_id") REFERENCES "public"."accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_replaced_by_refresh_tokens_id_fk" FOREIGN KEY ("replaced_by") REFERENCES "public"."refresh_tokens"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_users" ADD CONSTRAINT "company_users_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_users" ADD CONSTRAINT "company_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_accounts_id_company" ON "accounts" USING btree ("id","company_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_accounts_company_name" ON "accounts" USING btree ("company_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_transactions_id_company" ON "transactions" USING btree ("id","company_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_jwt_keys_kid" ON "jwt_keys" USING btree ("kid");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_refresh_token_hash" ON "refresh_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_companies_cnpj" ON "companies" USING btree ("cnpj");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_company_users_membership" ON "company_users" USING btree ("company_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_token_invites" ON "invites" USING btree ("token");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_projects_company_name" ON "projects" USING btree ("company_id","name");