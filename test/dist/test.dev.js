"use strict";

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
var chai = require('chai');

var chaiHttp = require('chai-http');

var app = require('../app');

var expect = chai.expect;
chai.use(chaiHttp);
describe('Authentication Endpoints', function () {
  describe('POST /auth/signup', function () {
    it('should create a new user account', function (done) {
      chai.request(app).post('/auth/signup').send({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'testpassword'
      }).end(function (err, res) {
        expect(res).to.have.status(201);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('token');
        done();
      });
    });
  });
  describe('POST /auth/login', function () {
    it('should log in to existing user account and receive access token', function (done) {
      chai.request(app).post('/auth/login').send({
        email: 'testuser@example.com',
        password: 'testpassword'
      }).end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('token');
        done();
      });
    });
  });
});
describe('Note Endpoints', function () {
  var authToken;
  before(function (done) {
    chai.request(app).post('/auth/login').send({
      email: 'testuser@example.com',
      password: 'testpassword'
    }).end(function (err, res) {
      authToken = res.body.token;
      done();
    });
  });
  describe('GET /notes', function () {
    it('should get a list of all notes for authenticated user', function (done) {
      chai.request(app).get('/notes').set('Authorization', "Bearer ".concat(authToken)).end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        done();
      });
    });
  });
  describe('GET /notes/:id', function () {
    it('should get a note by ID for the authenticated user', function (done) {
      chai.request(app).get('/notes/:id').set('Authorization', "Bearer ".concat(authToken)).end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('id', 1);
        done();
      });
    });
  });
  describe('POST /notes', function () {
    it('should create a new note for authenticated user', function (done) {
      chai.request(app).post('/notes').set('Authorization', "Bearer ".concat(authToken)).send({
        title: 'Test Note',
        content: 'This is a test note'
      }).end(function (err, res) {
        expect(res).to.have.status(201);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('title', 'Test Note');
        expect(res.body).to.have.property('content', 'This is a test note');
        done();
      });
    });
  }); // Test PUT /notes/:id endpoint

  describe('PUT /notes/:id', function () {
    it('should update an existing note by ID for authenticated user', function (done) {
      var id = '8'; // Replace with a valid note ID for your test data

      var updatedNote = {
        title: 'Updated Test Note',
        content: 'This is an updated test note.'
      };
      chai.request(app).put("/notes/".concat(id)).set('Authorization', "Bearer ".concat(authToken)).send(updatedNote).end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('id').to.equal(id);
        expect(res.body).to.have.property('title').to.equal(updatedNote.title);
        expect(res.body).to.have.property('content').to.equal(updatedNote.content);
        done();
      });
    });
  }); // describe('PUT /notes/:id', () => {
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