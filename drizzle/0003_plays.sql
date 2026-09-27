CREATE TABLE "plays" (
	"play_id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"game_id" text NOT NULL,
	"score" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "result_requests" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "result_requests" CASCADE;--> statement-breakpoint
ALTER TABLE "game_results" ALTER COLUMN "score" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "plays" ADD CONSTRAINT "plays_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "plays_user_date_game_idx" ON "plays" USING btree ("user_id","date","game_id");