ALTER TABLE "game_results" ADD COLUMN "attempts" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
UPDATE "game_results" SET "attempts" = counted."attempts" FROM (SELECT "user_id", "date", "game_id", count(*)::integer AS "attempts" FROM "plays" GROUP BY "user_id", "date", "game_id") AS counted WHERE "game_results"."user_id" = counted."user_id" AND "game_results"."date" = counted."date" AND "game_results"."game_id" = counted."game_id";--> statement-breakpoint
DROP TABLE "plays" CASCADE;
