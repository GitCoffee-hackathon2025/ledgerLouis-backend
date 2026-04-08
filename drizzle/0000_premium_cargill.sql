CREATE TABLE `accounts` (
	`id` char(26) NOT NULL,
	`company_id` char(26) NOT NULL,
	`name` varchar(100) NOT NULL,
	`type` enum('asset','expense','revenue') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp,
	`deletedAt` timestamp,
	CONSTRAINT `accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_accounts_id_company` UNIQUE(`id`,`company_id`),
	CONSTRAINT `uq_accounts_company_name` UNIQUE(`company_id`,`name`)
);
--> statement-breakpoint
CREATE TABLE `installments` (
	`id` char(26) NOT NULL,
	`transaction_id` char(26) NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`due_date` date NOT NULL,
	`status` enum('planned','paid','cancelled'),
	`paid_at` date,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp,
	`deletedAt` timestamp,
	CONSTRAINT `installments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ledger_entries` (
	`id` char(26) NOT NULL,
	`company_id` char(26) NOT NULL,
	`transaction_id` char(26) NOT NULL,
	`account_id` char(26) NOT NULL,
	`entry_type` enum('debit','credit') NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp,
	`deletedAt` timestamp,
	CONSTRAINT `ledger_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recurring_transactions` (
	`id` char(26) NOT NULL,
	`company_id` char(26) NOT NULL,
	`project_id` char(26) NOT NULL,
	`description` text,
	`amount` decimal(15,2) NOT NULL,
	`source_account_id` char(26) NOT NULL,
	`category_account_id` char(26) NOT NULL,
	`frequnecy` enum('weekly','monthly','yearly') NOT NULL,
	`interval_value` int,
	`start_date` date NOT NULL,
	`end_date` date,
	`next_run_date` date NOT NULL,
	CONSTRAINT `recurring_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` char(26) NOT NULL,
	`company_id` char(26) NOT NULL,
	`project_id` char(26) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp,
	`deletedAt` timestamp,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_transactions_id_company` UNIQUE(`id`,`company_id`)
);
--> statement-breakpoint
CREATE TABLE `refresh_tokens` (
	`id` char(26) NOT NULL,
	`session_id` char(26) NOT NULL,
	`token_hash` varchar(255) NOT NULL,
	`expires_at` datetime NOT NULL,
	`revoked_at` timestamp,
	`replaced_by_token_id` char(26),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp,
	`deletedAt` timestamp,
	CONSTRAINT `refresh_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_refresh_tokens_token_hash` UNIQUE(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` char(26) NOT NULL,
	`user_id` char(26) NOT NULL,
	`revoked_at` timestamp,
	`expires_at` datetime NOT NULL,
	`ip_address` varchar(45),
	`user_agent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp,
	`deletedAt` timestamp,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` char(26) NOT NULL,
	`name` varchar(150) NOT NULL,
	`email` varchar(150) NOT NULL,
	`passaword` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp,
	`deletedAt` timestamp,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `companies` (
	`id` char(26) NOT NULL,
	`name` varchar(150) NOT NULL,
	`cnpj` varchar(20) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp,
	`deletedAt` timestamp,
	CONSTRAINT `companies_id` PRIMARY KEY(`id`),
	CONSTRAINT `companies_cnpj_unique` UNIQUE(`cnpj`)
);
--> statement-breakpoint
CREATE TABLE `company_users` (
	`id` char(26) NOT NULL,
	`company_id` char(26) NOT NULL,
	`user_id` char(26) NOT NULL,
	`role` enum('owner','admin','viewer') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp,
	`deletedAt` timestamp,
	CONSTRAINT `company_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_company_users_membership` UNIQUE(`company_id`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE `invites` (
	`id` char(26) NOT NULL,
	`company_id` char(26) NOT NULL,
	`email` varchar(150) NOT NULL,
	`role` enum('admin','viewer') NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires_at` datetime NOT NULL,
	`accepted_at` datetime,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp,
	`deletedAt` timestamp,
	CONSTRAINT `invites_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_token_invites` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` char(26) NOT NULL,
	`company_id` char(26) NOT NULL,
	`name` varchar(150) NOT NULL,
	`description` text,
	`start_date` date,
	`end_date` date,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp,
	`deletedAt` timestamp,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_projects_company_name` UNIQUE(`company_id`,`name`)
);
--> statement-breakpoint
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `installments` ADD CONSTRAINT `installments_transaction_id_transactions_id_fk` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ledger_entries` ADD CONSTRAINT `ledger_entries_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ledger_entries` ADD CONSTRAINT `ledger_entries_transaction_id_transactions_id_fk` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ledger_entries` ADD CONSTRAINT `ledger_entries_account_id_accounts_id_fk` FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `recurring_transactions` ADD CONSTRAINT `recurring_transactions_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `recurring_transactions` ADD CONSTRAINT `recurring_transactions_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `recurring_transactions` ADD CONSTRAINT `recurring_transactions_source_account_id_accounts_id_fk` FOREIGN KEY (`source_account_id`) REFERENCES `accounts`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `recurring_transactions` ADD CONSTRAINT `recurring_transactions_category_account_id_companies_id_fk` FOREIGN KEY (`category_account_id`) REFERENCES `companies`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_session_id_sessions_id_fk` FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_replaced_by_token_id_refresh_tokens_id_fk` FOREIGN KEY (`replaced_by_token_id`) REFERENCES `refresh_tokens`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `company_users` ADD CONSTRAINT `company_users_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `company_users` ADD CONSTRAINT `company_users_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invites` ADD CONSTRAINT `invites_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projects` ADD CONSTRAINT `projects_company_id_companies_id_fk` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE restrict ON UPDATE no action;