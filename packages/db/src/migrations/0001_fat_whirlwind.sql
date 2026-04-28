ALTER TABLE "submission_status" DROP CONSTRAINT "score_range";--> statement-breakpoint
ALTER TABLE "submission_status" ADD CONSTRAINT "score_range" CHECK (
				CASE 
					WHEN "submission_status"."status" IN ('未提出', '提出済み') THEN "submission_status"."score" IS NULL
					WHEN "submission_status"."status" = '評定済み' THEN "submission_status"."score" >= 0 AND "submission_status"."score" <= 100
				END
			);