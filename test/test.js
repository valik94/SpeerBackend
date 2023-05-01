// const app = require('../app');
// const chai = require('chai');
// const chaiHttp = require('chai-http');
// const expect = chai.expect;

// chai.use(chaiHttp);

// describe('Notes API', () => {
//   let server;

//   before(done => {
//     server = app.listen(3001, () => {
//       console.log('Server listening on port 3001');
//       done();
//     });
//   });
  
//   after(done => {
//     server.close(done);
//   });

//   describe('POST /notes', () => {
//     it('should create a new note', (done) => {
//       const note = {
//         title: 'Test note',
//         content: 'This is a test note'
//       };
//       chai.request(server)
//         .post('/notes')
//         .send(note)
//         .end((err, res) => {
//           expect(res).to.have.status(200);
//           expect(res.body).to.have.property('message').equal('Note created successfully');
//           done();
//         });
//     });
//   });
// });

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const expect = chai.expect;

chai.use(chaiHttp);

describe('Authentication Endpoints', () => {
  describe('POST /auth/signup', () => {
    it('should create a new user account', (done) => {
      chai.request(app)
        .post('/auth/signup')
        .send({
          name: 'Test User',
          email: 'testuser@example.com',
          password: 'testpassword'
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('token');
          done();
        });
    });
  });

  describe('POST /auth/login', () => {
    it('should log in to existing user account and receive access token', (done) => {
      chai.request(app)
        .post('/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'testpassword'
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('token');
          done();
        });
    });
  });
});

describe('Note Endpoints', () => {
  let authToken;

  before((done) => {
    chai.request(app)
      .post('/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'testpassword'
      })
      .end((err, res) => {
        authToken = res.body.token;
        done();
      });
  });

  describe('GET /notes', () => {
    it('should get a list of all notes for authenticated user', (done) => {
      chai.request(app)
        .get('/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          done();
        });
    });
  });

  describe('GET /notes/:id', () => {
    it('should get a note by ID for the authenticated user', (done) => {
      chai.request(app)
        .get('/notes/:id')
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('id', 1);
          done();
        });
    });
  });

  describe('POST /notes', () => {
    it('should create a new note for authenticated user', (done) => {
      chai.request(app)
        .post('/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Note',
          content: 'This is a test note'
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('title', 'Test Note');
          expect(res.body).to.have.property('content', 'This is a test note');
          done();
        });
    });
  });

// Test PUT /notes/:id endpoint

describe('PUT /notes/:id', () => {
  it('should update an existing note by ID for authenticated user', async () => {
    const id = 8; // Replace with a valid note ID for your test data
    const updatedNote = {
      title: 'Updated Test Note',
      content: 'This is an updated test note.'
    };
    const authToken = 'insert_auth_token_here'; // Replace with a valid auth token for your test user

    const res = await chai.request(app)
      .put(`/notes/${id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatedNote);

    res.should.have.status(200);
    res.body.should.be.an('object');
    res.body.should.have.property('id').eql(id);
    res.body.should.have.property('title').eql(updatedNote.title);
    res.body.should.have.property('content').eql(updatedNote.content);

    // Retrieve the note from the database and verify that it has been updated
    const dbNote = await pool.query('SELECT * FROM notes WHERE id = $1', [id]);
    dbNote.rows.should.have.length(1);
    dbNote.rows[0].title.should.eql(updatedNote.title);
    dbNote.rows[0].content.should.eql(updatedNote.content);
  });

  // Add more test cases for error handling, authentication, etc.
});


// describe('PUT /notes/:id', () => {
//   it('should update an existing note by ID for authenticated user', (done) => {
//     const id = '8'; // Replace with a valid note ID for your test data
//     const updatedNote = {
//       title: 'Updated Test Note',
//       content: 'This is an updated test note.'
//     };
//     chai.request(app)
//       .put(`/notes/${id}`)
//       .set('Authorization', `Bearer ${authToken}`)
//       .send(updatedNote)
//       .end((err, res) => {
//         expect(res).to.have.status(200);
//         expect(res.body).to.be.an('object');
//         expect(res.body).to.have.property('id').to.equal(id);
//         expect(res.body).to.have.property('title').to.equal(updatedNote.title);
//         expect(res.body).to.have.property('content').to.equal(updatedNote.content);
//         done();
//       });
//   });
// });


// describe('PUT /notes/:id', () => {
//   it('should update an existing note by ID for authenticated user', (done) => {
//     const id = '8'; // Replace with a valid note ID for your test data
//     const updatedNote = {
//       title: 'Updated Test Note',
//       content: 'This is an updated test note.'
//     };
//     chai.request(app)
//       .put(`/notes/${id}`)
//       .set('Authorization', `Bearer ${authToken}`)
//       .send(updatedNote)
//       .end((err, res) => {
//         res.should.have.status(200);
//         res.body.should.be.an('object');
//         res.body.should.have.property('id').eql(id);
//         res.body.should.have.property('title').eql(updatedNote.title);
//         res.body.should.have.property('content').eql(updatedNote.content);
//         done();
//       });
//   });
// });

// describe('DELETE /notes/:id', () => {
//   it('should delete a note by ID for authenticated user', (done) => {
//     const authToken = 'insert auth token here';
//     const noteId = 'insert note ID here';
//     chai.request(app)
//       .delete(`/notes/${noteId}`)
//       .set('Authorization', `Bearer ${authToken}`)
//       .end((err, res) => {
//         res.should.have.status(200);
//         res.body.should.be.an('object');
//         res.body.should.have.property('message').eql('Note deleted successfully');
//         done();
//       });
//   });

//   it('should return a 401 error if not authenticated', (done) => {
//     const noteId = 'insert note ID here';
//     chai.request(app)
//       .delete(`/notes/${noteId}`)
//       .end((err, res) => {
//         res.should.have.status(401);
//         res.body.should.be.an('object');
//         res.body.should.have.property('message').eql('Unauthorized');
//         done();
//       });
//   });

//   it('should return a 404 error if note not found', (done) => {
//     const authToken = 'insert auth token here';
//     const noteId = 'insert non-existent note ID here';
//     chai.request(app)
//       .delete(`/notes/${noteId}`)
//       .set('Authorization', `Bearer ${authToken}`)
//       .end((err, res) => {
//         res.should.have.status(404);
//         res.body.should.be.an('object');
//         res.body.should.have.property('message').eql('Note not found');
//         done();
//       });
//   });
// });
});