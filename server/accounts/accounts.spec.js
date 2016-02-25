/*eslint expr: false*/

import app from '../server';
import chai from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
import Account from '../account/account.model';

const expect = chai.expect;
let cookies;

function connectDB(done) {
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

describe('==== User CRUD Tests ====', () => {
  before(connectDB);
  after(dropDB);

  describe('User Account Permissions', () => {
    describe('When the account is anonymous', () => {
      it('cannot read accounts', (done) => {
        request(app)
        .get('/api/accounts')
        .end((err, res) => {
          expect(res.status).to.be.equal(401);
          expect(res.body.statusCode).to.be.equal(401);
          done();
        });
      });

      it('cannot read an account', (done) => {
        request(app)
        .get('/api/accounts/1')
        .end((err, res) => {
          expect(res.status).to.be.equal(401);
          expect(res.body.statusCode).to.be.equal(401);
          done();
        });
      });

      it('cannot update an account', (done) => {
        request(app)
        .post('/api/accounts/1')
        .end((err, res) => {
          expect(res.status).to.be.equal(401);
          expect(res.body.statusCode).to.be.equal(401);
          done();
        });
      });

      it('cannot delete an account', (done) => {
        request(app)
        .delete('/api/accounts/1')
        .end((err, res) => {
          expect(res.status).to.be.equal(401);
          expect(res.body.statusCode).to.be.equal(401);
          done();
        });
      });
    });

    describe('When the account is logged in as a non-admin', () => {
      let cookies = null;

      before((done) => {
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

      it('cannot read accounts', (done) => {
        request(app)
        .get('/api/accounts')
        .set('Cookies', cookies)
        .end((err, res) => {
          expect(res.status).to.be.equal(401);
          expect(res.body.statusCode).to.be.equal(401);
          done();
        });
      });

      it('cannot read an account', (done) => {
        request(app)
        .get('/api/accounts/1')
        .set('Cookies', cookies)
        .end((err, res) => {
          expect(res.status).to.be.equal(401);
          expect(res.body.statusCode).to.be.equal(401);
          done();
        });
      });

      it('cannot update an account', (done) => {
        request(app)
        .post('/api/accounts/1')
        .set('Cookies', cookies)
        .end((err, res) => {
          expect(res.status).to.be.equal(401);
          expect(res.body.statusCode).to.be.equal(401);
          done();
        });
      });

      it('cannot delete an account', (done) => {
        request(app)
        .delete('/api/accounts/1')
        .set('Cookies', cookies)
        .end((err, res) => {
          expect(res.status).to.be.equal(401);
          expect(res.body.statusCode).to.be.equal(401);
          done();
        });
      });
    });

    describe('When an admin is logged in', () => {
      let cookies = [];

      before((done) => {
        Account.create({
          name: 'Admin',
          password: 'password',
          email: 'admin@admin.admin',
          role: 'admin'
        }, function (err, saved) {
          if ( saved ) {
            request(app)
            .post('/api/account/login')
            .send({ email: 'admin@admin.admin', password: 'password' })
            .end((err, res) => {
              const cookieHeaders = res.headers['set-cookie'];
              cookieHeaders.forEach((cookie) => {
                cookies.push(cookie.split(';')[0]);
              });
              expect(res.body.email).to.be.ok;
              expect(res.body.password).to.not.be.ok;
              done();
            });
          } else {
            throw new Error(err);
          }
        });
      });

      it('can read accounts', (done) => {
        request(app).get('/api/accounts')
        .set('Cookie', cookies)
        .end((err, res) => {
          console.log('can read accounts req.body: ', res.body);
          expect(res.status).to.be.equal(401);
          expect(res.body.statusCode).to.be.equal(401);
          done();
        });
      });

      xit('can read an account', (done) => {
        request(app)
        .get('/api/accounts/1')
        .set('Cookies', cookies)
        .end((err, res) => {
          expect(res.status).to.be.equal(401);
          expect(res.body.statusCode).to.be.equal(401);
          done();
        });
      });

      xit('can update an account', (done) => {
        request(app)
        .post('/api/accounts/1')
        .set('Cookies', cookies)
        .end((err, res) => {
          expect(res.status).to.be.equal(401);
          expect(res.body.statusCode).to.be.equal(401);
          done();
        });
      });

      xit('can delete an account', (done) => {
        request(app)
        .delete('/api/accounts/1')
        .set('Cookies', cookies)
        .end((err, res) => {
          expect(res.status).to.be.equal(401);
          expect(res.body.statusCode).to.be.equal(401);
          done();
        });
      });
    });
  });

  describe('User editing validation', () => {

  });
});
