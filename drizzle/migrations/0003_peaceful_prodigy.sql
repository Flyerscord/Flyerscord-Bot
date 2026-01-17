CREATE INDEX "daysuntil_enabled_idx" ON "daysuntil__dates" USING btree ("enabled");--> statement-breakpoint
CREATE INDEX "gamedayposts_channel_id_idx" ON "gamedayposts__posts" USING btree ("channel_id");--> statement-breakpoint
CREATE INDEX "joinleave_added_at_idx" ON "joinleave__not_verified_users" USING btree ("added_at");--> statement-breakpoint
CREATE INDEX "joinleave_timedout_at_idx" ON "joinleave__not_verified_users" USING btree ("timedout_at");--> statement-breakpoint
CREATE INDEX "levels_total_experience_idx" ON "levels__levels" USING btree ("total_experience");--> statement-breakpoint
CREATE INDEX "levels_current_level_idx" ON "levels__levels" USING btree ("current_level");--> statement-breakpoint
CREATE INDEX "pins_og_channel_id_idx" ON "pins__pins" USING btree ("og_channel_id");--> statement-breakpoint
CREATE INDEX "pins_pinned_at_idx" ON "pins__pins" USING btree ("pinned_at");--> statement-breakpoint
CREATE INDEX "pins_pinned_by_idx" ON "pins__pins" USING btree ("pinned_by");--> statement-breakpoint
CREATE INDEX "reactionrole_message_id_idx" ON "reactionrole__messages" USING btree ("message_id");