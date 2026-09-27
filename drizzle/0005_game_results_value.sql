ALTER TABLE "game_results" RENAME COLUMN "score" TO "value";--> statement-breakpoint
-- score는 작을수록 좋은 게임의 부호를 뒤집어 저장했다. value는 결과 값 그대로다.
UPDATE "game_results" SET "value" = -"value" WHERE "game_id" = 'reaction-time' AND "value" IS NOT NULL;
