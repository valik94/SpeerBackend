-- schema/create_notes.sql
DROP TABLE IF EXISTS notes CASCADE;
-- CREATE NOTES
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  user_id INTEGER REFERENCES users(id),
  search_vector TSVECTOR
);

--create index on search_vector column on notes table which is used to store full-text search index. 
--the gin index on the search vector column enables fast text search functionality.
CREATE INDEX notes_search_idx ON notes USING gin(search_vector);

-- CREATE function function to update search_vector column whenever a note is inserted or updated
CREATE OR REPLACE FUNCTION update_note_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', NEW.title), 'A') ||
    setweight(to_tsvector('english', NEW.content), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- CREATE TRIGGER to call the above function
CREATE TRIGGER notes_search_vector_update
BEFORE INSERT OR UPDATE ON notes
FOR EACH ROW
EXECUTE FUNCTION update_note_search_vector();

--   user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL
-- );
