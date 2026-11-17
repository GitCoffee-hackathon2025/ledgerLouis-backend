CREATE TABLE "inv_assets" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"ticker" varchar(16) NOT NULL,
	"name" varchar(200) NOT NULL,
	"kind" varchar(20) DEFAULT 'stock' NOT NULL,
	"market" varchar(2) DEFAULT 'B3' NOT NULL,
	"sector" varchar(100) DEFAULT '' NOT NULL,
	"subsector" varchar(100) DEFAULT '' NOT NULL,
	"logo_url" varchar(500) DEFAULT '' NOT NULL,
	"cnpj" varchar(18) DEFAULT '' NOT NULL,
	"aliases" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inv_fundamentals" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"asset_id" char(26) NOT NULL,
	"revenue" numeric(24, 4),
	"ebitda" numeric(24, 4),
	"total_debt" numeric(24, 4),
	"total_cash" numeric(24, 4),
	"eps" numeric(18, 8),
	"roe_reported" numeric(18, 8),
	"source" varchar(50) NOT NULL,
	"fetched_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inv_macro_points" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"code" varchar(30) NOT NULL,
	"name" varchar(100) NOT NULL,
	"unit" varchar(20) NOT NULL,
	"date" date NOT NULL,
	"value" numeric(18, 6) NOT NULL,
	"source" varchar(50) NOT NULL,
	"fetched_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inv_news_feeds" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"url" varchar(500) NOT NULL,
	"category" varchar(20) DEFAULT 'ticker' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"fetched_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "inv_news_item_assets" (
	"news_item_id" char(26) NOT NULL,
	"asset_id" char(26) NOT NULL,
	CONSTRAINT "inv_news_item_assets_news_item_id_asset_id_pk" PRIMARY KEY("news_item_id","asset_id")
);
--> statement-breakpoint
CREATE TABLE "inv_news_items" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"title" varchar(500) NOT NULL,
	"url" varchar(600) NOT NULL,
	"source" varchar(100) NOT NULL,
	"kind" varchar(40) NOT NULL,
	"published_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inv_niche_assets" (
	"niche_id" char(26) NOT NULL,
	"asset_id" char(26) NOT NULL,
	CONSTRAINT "inv_niche_assets_niche_id_asset_id_pk" PRIMARY KEY("niche_id","asset_id")
);
--> statement-breakpoint
CREATE TABLE "inv_niches" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(50) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"macro_codes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"external" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inv_price_bars" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"asset_id" char(26) NOT NULL,
	"date" date NOT NULL,
	"open" numeric(24, 4),
	"high" numeric(24, 4),
	"low" numeric(24, 4),
	"close" numeric(24, 4),
	"volume" numeric(24, 4),
	"source" varchar(50) NOT NULL,
	"fetched_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inv_quotes" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"asset_id" char(26) NOT NULL,
	"price" numeric(24, 4),
	"change_pct" numeric(18, 8),
	"volume" numeric(24, 4),
	"market_cap" numeric(24, 4),
	"source" varchar(50) NOT NULL,
	"fetched_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inv_alerts" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"user_id" char(26) NOT NULL,
	"kind" varchar(30) NOT NULL,
	"key" varchar(700) NOT NULL,
	"title" varchar(500) NOT NULL,
	"asset_id" char(26),
	"detail" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_on" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"seen" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inv_holdings" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"user_id" char(26) NOT NULL,
	"asset_id" char(26) NOT NULL,
	"quantity" numeric(20, 6) NOT NULL,
	"avg_price" numeric(24, 4),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inv_pending_changes" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"user_id" char(26) NOT NULL,
	"kind" varchar(20) NOT NULL,
	"payload" jsonb NOT NULL,
	"reason" text NOT NULL,
	"status" varchar(20) DEFAULT 'pendente' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"decided_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "inv_profiles" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"user_id" char(26) NOT NULL,
	"horizon_years" smallint,
	"risk_tolerance" varchar(20) DEFAULT '' NOT NULL,
	"monthly_contribution" numeric(24, 4),
	"avoid_sectors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"alert_daily_drop_pct" numeric(6, 2) DEFAULT 5 NOT NULL,
	"alert_max_asset_weight" numeric(7, 6) DEFAULT 0.2 NOT NULL,
	"alert_max_sector_weight" numeric(7, 6) DEFAULT 0.35 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inv_proposal_items" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"proposal_id" char(26) NOT NULL,
	"asset_id" char(26) NOT NULL,
	"action" varchar(20) NOT NULL,
	"target_weight" numeric(7, 6) NOT NULL,
	"thesis" text NOT NULL,
	"risks" text NOT NULL,
	"invalidation" text NOT NULL,
	"sources" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"price_at_proposal" numeric(24, 4),
	"decision" varchar(20) DEFAULT 'pendente' NOT NULL,
	"adjusted_weight" numeric(7, 6),
	"comment" text DEFAULT '' NOT NULL,
	"decided_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "inv_proposals" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"user_id" char(26) NOT NULL,
	"period" varchar(20) NOT NULL,
	"summary" text NOT NULL,
	"profile_snapshot" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inv_screen_commands" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"user_id" char(26) NOT NULL,
	"action" varchar(30) NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inv_screen_contexts" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"user_id" char(26) NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inv_theses" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"user_id" char(26) NOT NULL,
	"asset_id" char(26) NOT NULL,
	"summary" text NOT NULL,
	"expectation" varchar(10) NOT NULL,
	"entry_price" numeric(24, 4),
	"horizon_days" integer,
	"sources" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"origin" varchar(20) DEFAULT 'avulsa' NOT NULL,
	"decision" varchar(20) DEFAULT '' NOT NULL,
	"proposal_item_id" char(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inv_fundamentals" ADD CONSTRAINT "inv_fundamentals_asset_id_inv_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."inv_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inv_news_item_assets" ADD CONSTRAINT "inv_news_item_assets_news_item_id_inv_news_items_id_fk" FOREIGN KEY ("news_item_id") REFERENCES "public"."inv_news_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inv_news_item_assets" ADD CONSTRAINT "inv_news_item_assets_asset_id_inv_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."inv_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inv_niche_assets" ADD CONSTRAINT "inv_niche_assets_niche_id_inv_niches_id_fk" FOREIGN KEY ("niche_id") REFERENCES "public"."inv_niches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inv_niche_assets" ADD CONSTRAINT "inv_niche_assets_asset_id_inv_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."inv_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inv_price_bars" ADD CONSTRAINT "inv_price_bars_asset_id_inv_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."inv_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inv_quotes" ADD CONSTRAINT "inv_quotes_asset_id_inv_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."inv_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inv_alerts" ADD CONSTRAINT "inv_alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inv_alerts" ADD CONSTRAINT "inv_alerts_asset_id_inv_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."inv_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inv_holdings" ADD CONSTRAINT "inv_holdings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inv_holdings" ADD CONSTRAINT "inv_holdings_asset_id_inv_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."inv_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inv_pending_changes" ADD CONSTRAINT "inv_pending_changes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inv_profiles" ADD CONSTRAINT "inv_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inv_proposal_items" ADD CONSTRAINT "inv_proposal_items_proposal_id_inv_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."inv_proposals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inv_proposal_items" ADD CONSTRAINT "inv_proposal_items_asset_id_inv_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."inv_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inv_proposals" ADD CONSTRAINT "inv_proposals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inv_screen_commands" ADD CONSTRAINT "inv_screen_commands_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inv_screen_contexts" ADD CONSTRAINT "inv_screen_contexts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inv_theses" ADD CONSTRAINT "inv_theses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inv_theses" ADD CONSTRAINT "inv_theses_asset_id_inv_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."inv_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inv_theses" ADD CONSTRAINT "inv_theses_proposal_item_id_inv_proposal_items_id_fk" FOREIGN KEY ("proposal_item_id") REFERENCES "public"."inv_proposal_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_inv_assets_ticker" ON "inv_assets" USING btree ("ticker");--> statement-breakpoint
CREATE INDEX "ix_inv_assets_cnpj" ON "inv_assets" USING btree ("cnpj");--> statement-breakpoint
CREATE INDEX "ix_inv_fundamentals_latest" ON "inv_fundamentals" USING btree ("asset_id","fetched_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "uq_inv_macro_point" ON "inv_macro_points" USING btree ("code","date");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_inv_news_feeds_url" ON "inv_news_feeds" USING btree ("url");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_inv_news_items_url" ON "inv_news_items" USING btree ("url");--> statement-breakpoint
CREATE INDEX "ix_inv_news_items_published" ON "inv_news_items" USING btree ("published_at");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_inv_niches_name" ON "inv_niches" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_inv_niches_slug" ON "inv_niches" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_inv_price_bar_day" ON "inv_price_bars" USING btree ("asset_id","date");--> statement-breakpoint
CREATE INDEX "ix_inv_quotes_latest" ON "inv_quotes" USING btree ("asset_id","fetched_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "uq_inv_alerts_per_day" ON "inv_alerts" USING btree ("user_id","key","created_on");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_inv_holdings_user_asset" ON "inv_holdings" USING btree ("user_id","asset_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_inv_profiles_user" ON "inv_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ix_inv_proposals_user" ON "inv_proposals" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "ix_inv_screen_commands_user" ON "inv_screen_commands" USING btree ("user_id","id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_inv_screen_contexts_user" ON "inv_screen_contexts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_inv_theses_proposal_item" ON "inv_theses" USING btree ("proposal_item_id");