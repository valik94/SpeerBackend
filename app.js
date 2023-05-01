const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pg = require('pg');
const cookieSession = require("cookie-session");
const db = require("./db/configs/db.config.js");

// const app = express();
// const router = express.Router();

const pool = new pg.Pool({
  user: 'stars',
  host: 'localhost',
  database: 'notesdb',
  password: 'supersecretpassword',
  port: 5432,
});


const app = express()
app.use(bodyParser.json());
app.use(express.json());

app.use(cookieSession({
  name: "session",
  keys: ["public key", "private key"], //pseudo-secret keys
  maxAge: 24 * 60 * 60 * 1000 //24 hour expiry
}));

app.listen(3000, () => console.log(`Example app listening on port 3000`))


// module.exports = (db) => { 
//Test Home Page
app.get('/', (req, res) => {
  res.send('Hello World!')
})

// Authentication Endpoints
app.post('/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log('name:', name);
    console.log('email:', email);
    console.log('password:', password);
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('hashedPassword:', hashedPassword);
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
      [name, email, hashedPassword]
    );
    const user = { id: result.rows[0].id, name, email };
    const token = jwt.sign(user, '{F91CB522-82A0-4F35-848F-9762E941196F'); //JWT secret key
    res.status(201).json({ token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// app.post('/auth/signup', async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 10);
//     console.log('hashedPassword', hashedPassword);
//     const result = await pool.query(
//       'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
//       [name, email, hashedPassword]
//     );
//     const user = { id: result.rows[0].id, name, email };

//     // const user = {id:2, name:'Bob', email:'bob@gmail.com'};
//     const token = jwt.sign(user, process.env.JWT_SECRET); //JWT secret key
//     res.status(201).json({ token });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });


app.post('/auth/login', async (req, res) => {
  // console.log('login credentials:',req.query)
  //   console.log('email:', email);
  //   console.log('password', password);
  //   console.log('res.body:', res.body);
  try {
    const { email, password } = req.body;
    console.log('login credentials:',req.body)
    console.log('email:', email);
    console.log('password', password);
    console.log('res.body:', res.body);

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [
      email,
    ]);
    const user = result.rows[0];
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      req.session.userId = user.id; // Set the user ID in the session cookie 
      // console.log('req.session.userId:', req.session.userId);
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// app.post('/auth/login', async (req, res) => {
//   try {
//     const { email, password } = req.query;
//     console.log('login credentials:',req.query)
//     console.log('email:', email);
//     console.log('password', password);
//     const result = await pool.query('SELECT * FROM users WHERE email = $1', [
//       email,
//     ]);
//     const user = result.rows[0];
//     if (user && (bcrypt.compare(password, user.password))) {
//       req.session.userId = user.id; // Set the user ID in the session cookie 
//       console.log('req.session.userId:', req.session.userId);
//       res.json({ message: 'Login successful' });
//     } else {
//       res.status(401).json({ error: 'Invalid credentials' });
//     }
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });


// Note Endpoints
//retrieve all notes for a specific user 

app.get('/notes', async (req, res) => {
   console.log('notes');
  try {
    const decoded = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET); 
    //decision to switch authentication method
    const userId = decoded.id
    const result = await pool.query(
      'SELECT id, title, content, created_at, updated_at FROM notes WHERE user_id = $1 ORDER BY updated_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }

});

//retrieve a single note for a specific user
app.get('/notes/:id', async (req, res) => {

  // console.log("userId", req.body.userId)
  try {
    console.log("session id", session.id)
    console.log("req.session.userId", req.session.userId)
    const userId = req.session.userId; //double check this
    const noteId = req.params.id;
    const result = await pool.query(
      'SELECT * FROM notes WHERE id = $1 AND user_id = $2',
      [noteId, userId]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Note not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//create a new note for a specific user
app.post('/notes', async (req, res) => {
  console.log('post notes route')
  console.log('req.params.id', req.session.userId);
  console.log('req.query', req.body);
  console.log('request title', req.body);
  try {
    const userId = req.session.userId;
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required." });
    }
    const result = await pool.query(
      'INSERT INTO notes (title, content, user_id) VALUES ($1, $2, $3) RETURNING *',
      [title, content, userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//editing a note or updating a note


app.put('/notes/:id', async (req, res) => {
  console.log('put notes route');
  console.log('req.query', req.body);
  console.log('req.query.title', req.body.title);
  console.log('req.query.content', req.body.content);
  console.log('req.params.id', req.params.id);
  console.log('req.body', req.body);

  const id = parseInt(req.params.id);
  const { title, content } = req.body;

  try {
    const decoded = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET); 
    const userId = decoded.id;

    // validate id parameter and req.query data
    if (!id || isNaN(id) || !title || !content) {
      return res.status(400).json({ message: 'Invalid note data' });
    }

    const result = await pool.query(
      'SELECT * FROM notes WHERE id = $1 AND user_id = $2 LIMIT 1',
      [id, userId]
    );

    const note = result.rows[0];

    // check if note exists and belongs to the authenticated user
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // update note in the database
    await pool.query(
      'UPDATE notes SET title = $1, content = $2, updated_at = $3 WHERE id = $4',
      [title, content, new Date(), id]
    );

    // return updated note
    const updatedNoteResult = await pool.query(
      'SELECT * FROM notes WHERE id = $1',
      [id]
    );
    const updatedNote = updatedNoteResult.rows[0];
    res.json(updatedNote);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});




// app.put('/notes/:id', async (req, res) => {
//   console.log('put notes route');
//   console.log('req.query', req.body);
//   console.log('req.query.title', req.body.title);
//   console.log('req.query.content', req.body.content);
//   console.log('req.params.id', req.params.id);
//   console.log('req.body', req.body);

//     const id = parseInt(req.params.id);
//     const { title, content } = req.body;
//     // const userId = req.session.id;
//     const decoded = jwt.verify(req.headers.authorization.split(' ')[1], '{F91CB522-82A0-4F35-848F-9762E941196F}'); 
//     //decision to switch authentication method
//     const userId = decoded.id

//     // validate id parameter and req.query data
//     if (!id || isNaN(id) || !title || !content) {
//       return res.status(400).json({ message: 'Invalid note data' });
//     }
//     // const userId = req.params.id;
//     console.log('userId', userId);
//     try {
      
//     console.log('userId', userId)
//       const result = await pool.query(
//         'SELECT * FROM notes WHERE id = $1 AND user_id = $2 LIMIT 1',
//         [id, userId]
//       );
//       // console.log('result.fields.Field.content', result.fields.Field.content);
//       console.log('result is',result);
//       const note = result.rows[0];
//       console.log('new note is', note)
  
//       // check if note exists and belongs to the authenticated user
//       if (!note) {
//         return res.status(404).json({ message: 'Note not found' });
//       }
  
//       // update note in the database
//       await pool.query(
//         'UPDATE notes SET title = $1, content = $2, updated_at = $3 WHERE id = $4',
//         [title, content, new Date(), id]
//       );
  
//       // get the updated note from the database
//       const updatedResult = await pool.query(
//         'SELECT * FROM notes WHERE id = $1',
//         [id]
//       );
//       const updatedNote = updatedResult.rows[0];
  
//       return res.status(200).json(updatedNote);
//     } catch (err) {
//       console.error(err);
//       return res.status(500).json({ message: 'Server error' });
//     }
//   });

  //Query to delete note by id
  app.delete('/notes/:id', async (req, res) => {
    console.log('delete notes route');
    console.log('req.params.id', req.params.id);
    console.log('req.body', req.body);
    console.log('req.query', req.query);
    const id = parseInt(req.params.id, 10);

  // Parse the note ID from the request parameters and ensure it's a valid number
    if (!id || isNaN(id)){
        return res.status(400).json({ message: 'Invalid note id' });
    }

    const userId = req.session.userId;
    console.log('userId', userId)
    try {
      // Check if the note exists and belongs to the user
      const result = await pool.query(
        'SELECT * FROM notes WHERE id = $1 AND user_id = $2',
        [id, userId]
      );
  
      // If the note exists and belongs to the user, delete it from the database
    await pool.query('DELETE FROM notes WHERE id = $1', [id]);

    // Return a 204 status code to indicate success
    return res.status(204).json({ message: 'Note deleted successfully' });
  } catch (err) {
    console.error(err);
    // If there's an error, return a 500 status code and an error message
    return res.status(500).json({ message: 'Server error' });
  }
});


app.get('/search', async (req, res) => {
  console.log('search route');
  console.log('req.query', req.query);
  try {
    const { q } = req.query; //extract the query from the request query string as q
    const queryString = `SELECT * FROM notes WHERE title ILIKE '%${q}%' OR content ILIKE '%${q}%'`; //build the SQL query string that searches the notes table for notes that contain the q(string) term either in title or content
    const { rows } = await pool.query(queryString);  //return the results of the query to the client in JSON format

    res.json(rows);//return the results of the query to the client in JSON format as array
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// }
// module.exports = router;
module.exports = app;
