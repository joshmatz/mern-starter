/*eslint expr: false*/

// import mocha from 'mocha';
import app from '../server';
import chai from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
import Account from './account.model';
// import Post from '../post/post.model';

const expect = chai.expect;
let Cookie = [];

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

  describe('On registration with valid credentials...', () => {
    it('should return the user', (done) => {
      request(app)
      .post('/api/account/register')
      .send({ email: 'foo@foo.foo', password: 'bar', name: 'Jonah' })
      .end((err, res) => {
        res.headers['set-cookie'].forEach((cookie) => {
          Cookie.push(cookie.split(';')[0]);
        });
        expect(res.body.email).to.be.ok;
        expect(res.body.password).to.not.be.ok;
        done();
      });
    });

    it('should have the user be logged in', (done) => {
      request(app)
      .get('/api/account')
      .set('Cookie', Cookie)
      .end((err, res) => {
        expect(res.body.email).to.be.ok;
        expect(res.body.password).to.not.be.ok;
        done();
      });
    });

  });

  describe('After registering...', () => {
    it('should allow the user to logout', (done) => {
      request(app)
      .post('/api/account/logout')
      .set('Cookie', Cookie)
      .end((err, res) => {
        expect(res.body).to.not.be.ok;
        done();
      });
    });

    it('should not have a session after logging out', (done) => {
      request(app)
      .post('/api/account')
      .set('Cookie', Cookie)
      .end((err, res) => {
        Cookie = [];
        expect(res.status).to.be.equal(401);
        done();
      });
    });

    it('should not be able to login with invalid credentials', (done) => {
      request(app)
      .post('/api/account/login')
      .send({ email: 'foo@foo.foo', password: 'foo' })
      .end((err, res) => {
        expect(res.status).to.be.equal(401);
        expect(res.body.statusCode).to.be.equal(401);
        expect(res.body.email).to.not.be.ok;
        done();
      });
    });

    it('should allow the user to login', (done) => {
      request(app)
      .post('/api/account/login')
      .send({ email: 'foo@foo.foo', password: 'bar' })
      .end((err, res) => {
        expect(res.body.email).to.be.ok;
        expect(res.body.password).to.not.be.ok;
        done();
      });
    });

    it('should allow the user to request password reset token', (done) => {
      request(app)
      .post('/api/account/token')
      .send({ email: 'foo@foo.foo'})
      .end((err, res) => {
        expect(res.statusCode).to.be.equal(200);
        expect(res.body).to.not.be.ok;
        done();
      });
    });

    it('should not allow the user to reset their password with a valid reset token', (done) => {
      request(app)
      .post('/api/account/reset')
      .send({ password: 'no', token: 'mioj2340j123490kdsf09k1234k09sdf'})
      .end((err, res) => {
        expect(res.statusCode).to.be.equal(404);
        done();
      });
    });

    it('should allow the user to reset their password with a valid reset token', (done) => {
      Account.findOne({resetPasswordExpires: {$gt: new Date()}}, '+password', (err, found) => {
        request(app)
        .post('/api/account/reset/')
        .send({ password: 'no', token: found.resetPasswordToken})
        .end((requestErr, res) => {
          expect(res.statusCode).to.be.equal(200);

          Account.findOne({email: found.email}, '+password', (nextErr, again) => {
            expect(again.password).to.not.be.equal(found.password);
            expect(again.password).to.not.be.equal('no');
            done();
          });
        });
      });
    });
  });
});
