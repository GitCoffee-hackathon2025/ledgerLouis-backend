ALTER TABLE `recurring_transactions` RENAME COLUMN `project_id` TO `frequency`;--> statement-breakpoint
ALTER TABLE `users` RENAME COLUMN `passaword` TO `password`;--> statement-breakpoint
ALTER TABLE `recurring_transactions` DROP FOREIGN KEY `recurring_transactions_project_id_projects_id_fk`;
--> statement-breakpoint
ALTER TABLE `recurring_transactions` DROP FOREIGN KEY `recurring_transactions_category_account_id_companies_id_fk`;
--> statement-breakpoint
ALTER TABLE `recurring_transactions` MODIFY COLUMN `frequency` enum('weekly','monthly','yearly') NOT NULL;--> statement-breakpoint
ALTER TABLE `transactions` MODIFY COLUMN `project_id` char(26);--> statement-breakpoint
ALTER TABLE `recurring_transactions` ADD CONSTRAINT `recurring_transactions_category_account_id_accounts_id_fk` FOREIGN KEY (`category_account_id`) REFERENCES `accounts`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `recurring_transactions` DROP COLUMN `frequnecy`;