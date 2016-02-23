/*eslint expr: false*/

// import mocha from 'mocha';
import app from '../server';
import chai from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
// import Account from './account.model';
// import Post from '../post/post.model';

const expect = chai.expect;
let cookies;

function connectDB(done) {
  // if (mongoose.connection.name !== 'mern-test') {
  //   return done();
  // }

  mongoose.connect((process.env.MONGO_URL || 'mongodb://localhost:27017/mern-test'), (err) => {
    if (err) {
      console.log('mongoose:err: ', err);
      return done(err);
    }
    done();
  });
}

function dropDB(done) {
  if (mongoose.connection.name !== 'mern-test') {
    return done();
  }

  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(done);
  });
}

describe('Account Registration Tests', () => {
  before(connectDB);
  after(dropDB);

  describe('When a user tries to register with valid credentials', () => {
    it('should return the user', (done) => {
      request(app)
      .post('/api/account/register')
      .send({ email: 'foo@foo.foo', password: 'bar', name: 'Jonah' })
      .end((err, res) => {
        const cookieHeaders = res.headers['set-cookie'];
        cookies = cookieHeaders.pop().split(';')[0];
        expect(res.body.email).to.be.ok;
        expect(res.body.password).to.not.be.ok;
        done();
      });
    });

    it('should have the user be logged in', (done) => {
      const req = request(app).get('/api/account');

      req.cookies = cookies;

      req
      .set('Cookie', cookies)
      .end((err, res) => {
        expect(res.body.email).to.be.ok;
        expect(res.body.password).to.not.be.ok;
        done();
      });
    });

    it('should allow the user to be logged out', (done) => {
      const req = request(app).post('/api/account/logout');

      req.cookies = cookies;

      req
      .set('Cookie', cookies)
      .end((err, res) => {
        console.log('/api/account/logout::err: ', err);
        expect(res.body).to.not.be.ok;
        done();
      });
    });

    it('should allow the user to login', (done) => {
      request(app)
      .post('/api/account/login')
      .send({ email: 'foo@foo.foo', password: 'bar' })
      .end((err, res) => {
        const cookieHeaders = res.headers['set-cookie'];
        cookies = cookieHeaders.pop().split(';')[0];
        expect(res.body.email).to.be.ok;
        expect(res.body.password).to.not.be.ok;
        done();
      });
    });
  });
});
