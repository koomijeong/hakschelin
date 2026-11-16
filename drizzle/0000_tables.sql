CREATE TABLE profiles (user_id TEXT PRIMARY KEY, data TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE favorites (user_id TEXT NOT NULL, menu_id TEXT NOT NULL, PRIMARY KEY(user_id,menu_id));
--> statement-breakpoint
CREATE TABLE meals (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, menu_id TEXT NOT NULL, price INTEGER NOT NULL, restaurant TEXT NOT NULL, date TEXT NOT NULL, UNIQUE(user_id,menu_id,date));
--> statement-breakpoint
CREATE TABLE reviews (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, menu_id TEXT NOT NULL, rating INTEGER NOT NULL, body TEXT NOT NULL, tags TEXT NOT NULL, created TEXT NOT NULL, UNIQUE(user_id,menu_id));
--> statement-breakpoint
CREATE TABLE reactions (user_id TEXT NOT NULL, review_id TEXT NOT NULL, PRIMARY KEY(user_id,review_id));
--> statement-breakpoint
CREATE TABLE replies (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, review_id TEXT NOT NULL, body TEXT NOT NULL, created TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE messages (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, body TEXT NOT NULL, created TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE reports (id TEXT PRIMARY KEY,user_id TEXT NOT NULL,target TEXT NOT NULL,reason TEXT NOT NULL,created TEXT NOT NULL);
