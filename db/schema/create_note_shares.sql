--junction table note_shares
DROP TABLE IF EXISTS note_shares CASCADE;
---- CREATE NOTE_SHARES table
-- contains 2 foreign keys one for notes and one of users table to keep track of which notes shared with which users.
CREATE TABLE note_shares (
  id SERIAL PRIMARY KEY,
  note_id INTEGER REFERENCES notes(id),
  user_id INTEGER REFERENCES users(id)
);
