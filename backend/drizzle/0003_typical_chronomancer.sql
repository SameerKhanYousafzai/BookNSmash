CREATE INDEX "event_reg_registered_at_idx" ON "event_registrations" USING btree ("registered_at");--> statement-breakpoint
CREATE INDEX "matches_match_date_idx" ON "matches" USING btree ("match_date");--> statement-breakpoint
CREATE INDEX "teams_created_at_idx" ON "teams" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "venue_bookings_created_at_idx" ON "venue_bookings" USING btree ("created_at");