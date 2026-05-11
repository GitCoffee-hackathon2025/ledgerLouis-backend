ALTER TABLE `companies` MODIFY COLUMN `cnpj` char(14) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `uq_users_email` UNIQUE(`email`);--> statement-breakpoint
ALTER TABLE `companies` ADD CONSTRAINT `uq_companies_cnpj` UNIQUE(`cnpj`);