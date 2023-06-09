### Backend Speer Project
## This backend application was designed to have users and notes and users are able tos hare notes with other users based on their user id as well as search and find notes.

The following is a brief summary of the applications technical specifications:

The require function is used to load the required Node.js modules.

A connection pool is created using the pg module to handle connections to a PostgreSQL database.

A session middleware is created using the cookie-session module to manage session data in the form of encrypted cookies.

A GET endpoint is defined for the root path (/), which simply sends a "Hello World!" message as the response.

Two POST endpoints are defined for /auth/signup and /auth/login. /auth/signup expects a JSON payload containing the user's name, email, and password. 

The password is hashed using bcrypt before being stored in the database. A JWT token is then generated using jsonwebtoken and returned to the client. 

/auth/login expects a query string containing the user's email and password. 

The email is used to retrieve the user's hashed password from the database. The provided password is then compared to the hashed password using bcrypt. If they match, a session cookie is created and the client is sent a "Login successful" message. If they don't match, the client is sent a "Invalid credentials" message.

Two GET endpoints are defined for /notes and /notes/:id. /notes expects a JWT token to be provided in the Authorization header. The token is verified using jsonwebtoken, and the user ID is extracted from it. 

A query is then executed to retrieve all notes that belong to the user with that ID. /notes/:id expects a note ID to be provided as a URL parameter. The user ID is retrieved from the session cookie. A query is then executed to retrieve the note with that ID that belongs to the user with that ID.
