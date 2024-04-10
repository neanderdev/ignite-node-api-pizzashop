ALTER TABLE "evaluations" DROP CONSTRAINT "evaluations_restaurant_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "evaluations" DROP CONSTRAINT "evaluations_customer_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "evaluations" ALTER COLUMN "restaurant_id" SET NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
