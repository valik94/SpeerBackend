"use strict";

var express = require('express');

var bodyParser = require('body-parser');

var jwt = require('jsonwebtoken');

var bcrypt = require('bcrypt');

var pg = require('pg');

var cookieSession = require("cookie-session");

var db = require("./db/configs/db.config.js"); // const app = express();
// const router = express.Router();


var pool = new pg.Pool({
  user: 'stars',
  host: 'localhost',
  database: 'notesdb',
  password: 'supersecretpassword',
  port: 5432
});
var app = express();
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieSession({
  name: "session",
  keys: ["public key", "private key"],
  //pseudo-secret keys
  maxAge: 24 * 60 * 60 * 1000 //24 hour expiry

}));
app.listen(3000, function () {
  return console.log("Example app listening on port 3000");
}); // module.exports = (db) => { 
//Test Home Page

app.get('/', function (req, res) {
  res.send('Hello World!');
}); // Authentication Endpoints

app.post('/auth/signup', function _callee(req, res) {
  var _req$body, name, email, password, hashedPassword, result, user, token;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _req$body = req.body, name = _req$body.name, email = _req$body.email, password = _req$body.password;
          console.log('name:', name);
          console.log('email:', email);
          console.log('password:', password);
          _context.next = 7;
          return regeneratorRuntime.awrap(bcrypt.hash(password, 10));

        case 7:
          hashedPassword = _context.sent;
          console.log('hashedPassword:', hashedPassword);
          _context.next = 11;
          return regeneratorRuntime.awrap(pool.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id', [name, email, hashedPassword]));

        case 11:
          result = _context.sent;
          user = {
            id: result.rows[0].id,
            name: name,
            email: email
          };
          token = jwt.sign(user, '{F91CB522-82A0-4F35-848F-9762E941196F'); //JWT secret key

          res.status(201).json({
            token: token
          });
          _context.next = 20;
          break;

        case 17:
          _context.prev = 17;
          _context.t0 = _context["catch"](0);
          res.status(400).json({
            error: _context.t0.message
          });

        case 20:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 17]]);
}); // app.post('/auth/signup', async (req, res) => {
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

app.post('/auth/login', function _callee2(req, res) {
  var _req$body2, email, password, result, user, token;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _req$body2 = req.body, email = _req$body2.email, password = _req$body2.password;
          console.log('login credentials:', req.body);
          console.log('email:', email);
          console.log('password', password);
          console.log('res.body:', res.body);
          _context2.next = 8;
          return regeneratorRuntime.awrap(pool.query('SELECT * FROM users WHERE email = $1', [email]));

        case 8:
          result = _context2.sent;
          user = result.rows[0];
          _context2.t0 = user;

          if (!_context2.t0) {
            _context2.next = 15;
            break;
          }

          _context2.next = 14;
          return regeneratorRuntime.awrap(bcrypt.compare(password, user.password));

        case 14:
          _context2.t0 = _context2.sent;

        case 15:
          if (!_context2.t0) {
            _context2.next = 21;
            break;
          }

          token = jwt.sign({
            userId: user.id
          }, '{F91CB522-82A0-4F35-848F-9762E941196F}', {
            expiresIn: '1h'
          });
          req.session.userId = user.id; // Set the user ID in the session cookie 
          // console.log('req.session.userId:', req.session.userId);

          res.json({
            token: token
          });
          _context2.next = 22;
          break;

        case 21:
          res.status(401).json({
            error: 'Invalid credentials'
          });

        case 22:
          _context2.next = 27;
          break;

        case 24:
          _context2.prev = 24;
          _context2.t1 = _context2["catch"](0);
          res.status(400).json({
            error: _context2.t1.message
          });

        case 27:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 24]]);
}); // app.post('/auth/login', async (req, res) => {
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

app.get('/notes', function _callee3(req, res) {
  var decoded, _userId, result;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          console.log('notes');
          _context3.prev = 1;
          decoded = jwt.verify(req.headers.authorization.split(' ')[1], '{F91CB522-82A0-4F35-848F-9762E941196F}'); //decision to switch authentication method

          _userId = decoded.id;
          _context3.next = 6;
          return regeneratorRuntime.awrap(pool.query('SELECT id, title, content, created_at, updated_at FROM notes WHERE user_id = $1 ORDER BY updated_at DESC', [_userId]));

        case 6:
          result = _context3.sent;
          res.json(result.rows);
          _context3.next = 13;
          break;

        case 10:
          _context3.prev = 10;
          _context3.t0 = _context3["catch"](1);
          res.status(400).json({
            error: _context3.t0.message
          });

        case 13:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[1, 10]]);
}); //retrieve a single note for a specific user

app.get('/notes/:id', function _callee4(req, res) {
  var _userId2, noteId, result;

  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          console.log("session id", session.id);
          console.log("req.session.userId", req.session.userId);
          _userId2 = req.session.userId; //double check this

          noteId = req.params.id;
          _context4.next = 7;
          return regeneratorRuntime.awrap(pool.query('SELECT * FROM notes WHERE id = $1 AND user_id = $2', [noteId, _userId2]));

        case 7:
          result = _context4.sent;

          if (result.rowCount === 0) {
            res.status(404).json({
              error: 'Note not found'
            });
          } else {
            res.json(result.rows[0]);
          }

          _context4.next = 14;
          break;

        case 11:
          _context4.prev = 11;
          _context4.t0 = _context4["catch"](0);
          res.status(400).json({
            error: _context4.t0.message
          });

        case 14:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 11]]);
}); //create a new note for a specific user

app.post('/notes', function _callee5(req, res) {
  var _userId3, _req$body3, title, content, result;

  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          console.log('post notes route');
          console.log('req.params.id', req.session.userId);
          console.log('req.query', req.body);
          console.log('request title', req.body);
          _context5.prev = 4;
          _userId3 = req.session.userId;
          _req$body3 = req.body, title = _req$body3.title, content = _req$body3.content;

          if (!(!title || !content)) {
            _context5.next = 9;
            break;
          }

          return _context5.abrupt("return", res.status(400).json({
            error: "Title and content are required."
          }));

        case 9:
          _context5.next = 11;
          return regeneratorRuntime.awrap(pool.query('INSERT INTO notes (title, content, user_id) VALUES ($1, $2, $3) RETURNING *', [title, content, _userId3]));

        case 11:
          result = _context5.sent;
          res.status(201).json(result.rows[0]);
          _context5.next = 18;
          break;

        case 15:
          _context5.prev = 15;
          _context5.t0 = _context5["catch"](4);
          res.status(400).json({
            error: _context5.t0.message
          });

        case 18:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[4, 15]]);
}); //editing a note or updating a note

app.put('/notes/:id', function _callee6(req, res) {
  var id, _req$body4, title, content, decoded, _userId4, result, note, updatedResult, updatedNote;

  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          console.log('put notes route');
          console.log('req.query', req.body);
          console.log('req.query.title', req.body.title);
          console.log('req.query.content', req.body.content);
          console.log('req.params.id', req.params.id);
          console.log('req.body', req.body);
          id = parseInt(req.params.id);
          _req$body4 = req.body, title = _req$body4.title, content = _req$body4.content; // const userId = req.session.id;
          // validate id parameter and req.query data

          if (!(!id || isNaN(id) || !title || !content)) {
            _context6.next = 10;
            break;
          }

          return _context6.abrupt("return", res.status(400).json({
            message: 'Invalid note data'
          }));

        case 10:
          // const userId = req.params.id;
          console.log('userId', userId);
          _context6.prev = 11;
          decoded = jwt.verify(req.headers.authorization.split(' ')[1], '{F91CB522-82A0-4F35-848F-9762E941196F}'); //decision to switch authentication method

          _userId4 = decoded.id;
          _context6.next = 16;
          return regeneratorRuntime.awrap(pool.query('SELECT * FROM notes WHERE id = $1 AND user_id = $2 LIMIT 1', [id, _userId4]));

        case 16:
          result = _context6.sent;
          // console.log('result.fields.Field.content', result.fields.Field.content);
          console.log('result is', result);
          note = result.rows[0];
          console.log('new note is', note); // check if note exists and belongs to the authenticated user

          if (note) {
            _context6.next = 22;
            break;
          }

          return _context6.abrupt("return", res.status(404).json({
            message: 'Note not found'
          }));

        case 22:
          _context6.next = 24;
          return regeneratorRuntime.awrap(pool.query('UPDATE notes SET title = $1, content = $2, updated_at = $3 WHERE id = $4', [title, content, new Date(), id]));

        case 24:
          _context6.next = 26;
          return regeneratorRuntime.awrap(pool.query('SELECT * FROM notes WHERE id = $1', [id]));

        case 26:
          updatedResult = _context6.sent;
          updatedNote = updatedResult.rows[0];
          return _context6.abrupt("return", res.status(200).json(updatedNote));

        case 31:
          _context6.prev = 31;
          _context6.t0 = _context6["catch"](11);
          console.error(_context6.t0);
          return _context6.abrupt("return", res.status(500).json({
            message: 'Server error'
          }));

        case 35:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[11, 31]]);
}); //Where is the delete query here? -- DOUBLE CHECK THIS
//deleting a note **********

app["delete"]('/notes/:id', function _callee7(req, res) {
  var id, userId, result;
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          console.log('delete notes route');
          console.log('req.params.id', req.params.id);
          console.log('req.body', req.body);
          console.log('req.query', req.query);
          id = parseInt(req.params.id, 10); // Parse the note ID from the request parameters and ensure it's a valid number

          if (!(!id || isNaN(id))) {
            _context7.next = 7;
            break;
          }

          return _context7.abrupt("return", res.status(400).json({
            message: 'Invalid note id'
          }));

        case 7:
          userId = req.session.userId;
          _context7.prev = 8;
          _context7.next = 11;
          return regeneratorRuntime.awrap(pool.query('SELECT * FROM notes WHERE id = $1 AND user_id = $2', [id, userId]));

        case 11:
          result = _context7.sent;
          _context7.next = 14;
          return regeneratorRuntime.awrap(pool.query('DELETE FROM notes WHERE id = $1', [id]));

        case 14:
          return _context7.abrupt("return", res.status(204).json({
            message: 'Note deleted successfully'
          }));

        case 17:
          _context7.prev = 17;
          _context7.t0 = _context7["catch"](8);
          console.error(_context7.t0); // If there's an error, return a 500 status code and an error message

          return _context7.abrupt("return", res.status(500).json({
            message: 'Server error'
          }));

        case 21:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[8, 17]]);
});
app.get('/search', function _callee8(req, res) {
  var q, queryString, _ref, rows;

  return regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          console.log('search route');
          console.log('req.query', req.query);
          _context8.prev = 2;
          q = req.query.q; //extract the query from the request query string as q

          queryString = "SELECT * FROM notes WHERE title ILIKE '%".concat(q, "%' OR content ILIKE '%").concat(q, "%'"); //build the SQL query string that searches the notes table for notes that contain the q(string) term either in title or content

          _context8.next = 7;
          return regeneratorRuntime.awrap(pool.query(queryString));

        case 7:
          _ref = _context8.sent;
          rows = _ref.rows;
          //return the results of the query to the client in JSON format
          res.json(rows); //return the results of the query to the client in JSON format as array

          _context8.next = 16;
          break;

        case 12:
          _context8.prev = 12;
          _context8.t0 = _context8["catch"](2);
          console.error(_context8.t0);
          res.status(500).json({
            message: 'Internal server error'
          });

        case 16:
        case "end":
          return _context8.stop();
      }
    }
  }, null, null, [[2, 12]]);
}); // }
// module.exports = router;

module.exports = app;