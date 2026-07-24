CREATE TABLE "transaction_documents" (
	"file_id" char(26) PRIMARY KEY NOT NULL,
	"transaction_id" char(26) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_profile_images" DROP CONSTRAINT "user_profile_images_file_id_unique";--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "cnpj" SET DATA TYPE char(14);--> statement-breakpoint
ALTER TABLE "user_profile_images" ADD PRIMARY KEY ("file_id");--> statement-breakpoint
ALTER TABLE "user_profile_images" ALTER COLUMN "user_id" SET DATA TYPE char(26);--> statement-breakpoint
ALTER TABLE "user_profile_images" ALTER COLUMN "file_id" SET DATA TYPE char(26);--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "email" varchar(150);--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "cep" char(8);--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "phone" varchar(11);--> statement-breakpoint
ALTER TABLE "transaction_documents" ADD CONSTRAINT "transaction_documents_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_documents" ADD CONSTRAINT "transaction_documents_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profile_images" ADD CONSTRAINT "user_profile_images_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profile_images" ADD CONSTRAINT "user_profile_images_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_companies_email" ON "companies" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_companies_phone" ON "companies" USING btree ("phone");--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "avatar";--> statement-breakpoint
ALTER TABLE "user_profile_images" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "user_profile_images" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "user_profile_images" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "user_profile_images" DROP COLUMN "deleted_at";