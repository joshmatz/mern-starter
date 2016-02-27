/*eslint expr: false*/

import app from '../server';
import chai from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
import Account from '../account/account.model';

const expect = chai.expect;

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
      let Cookie = [];

      before((done) => {
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

      it('cannot read accounts', (done) => {
        request(app)
        .get('/api/accounts')
        .set('Cookie', Cookie)
        .end((err, res) => {
          expect(res.status).to.be.equal(401);
          expect(res.body.statusCode).to.be.equal(401);
          done();
        });
      });

      it('cannot read an account', (done) => {
        request(app)
        .get('/api/accounts/1')
        .set('Cookie', Cookie)
        .end((err, res) => {
          expect(res.status).to.be.equal(401);
          expect(res.body.statusCode).to.be.equal(401);
          done();
        });
      });

      it('cannot update an account', (done) => {
        request(app)
        .post('/api/accounts/1')
        .set('Cookie', Cookie)
        .end((err, res) => {
          expect(res.status).to.be.equal(401);
          expect(res.body.statusCode).to.be.equal(401);
          done();
        });
      });

      it('cannot delete an account', (done) => {
        request(app)
        .delete('/api/accounts/1')
        .set('Cookie', Cookie)
        .end((err, res) => {
          expect(res.status).to.be.equal(401);
          expect(res.body.statusCode).to.be.equal(401);
          done();
        });
      });
    });

    describe('When an admin is logged in', () => {
      let Cookie = [];
      let existingAccount = 0;

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
              res.headers['set-cookie'].forEach((cookie) => {
                Cookie.push(cookie.split(';')[0]);
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
        request(app)
        .get('/api/accounts')
        .set('Cookie', Cookie)
        .end((err, res) => {
          existingAccount = res.body.docs[0];
          expect(existingAccount.password).to.not.be.ok;
          expect(res.body.docs).to.be.ok;
          expect(res.body.total).to.be.ok;
          expect(res.body.limit).to.be.ok;
          expect(res.body.page).to.be.ok;
          expect(res.body.pages).to.be.ok;
          expect(res.status).to.be.equal(200);
          done();
        });
      });

      it('can read an account', (done) => {
        request(app)
        .get(`/api/accounts/${existingAccount.id}`)
        .set('Cookie', Cookie)
        .end((err, res) => {
          expect(res.body.email).to.be.ok;
          expect(res.body.password).to.not.be.ok;
          expect(res.status).to.be.equal(200);
          done();
        });
      });

      it('can update an account', (done) => {
        request(app)
        .post(`/api/accounts/${existingAccount.id}`)
        .send({name: 'George'})
        .set('Cookie', Cookie)
        .end((err, res) => {
          expect(res.body.name).to.be.equal('George');
          expect(res.status).to.be.equal(200);
          done();
        });
      });

      it('can delete an account', (done) => {
        request(app)
        .delete(`/api/accounts/${existingAccount.id}`)
        .set('Cookie', Cookie)
        .end((err, res) => {
          expect(res.status).to.be.equal(200);
          expect(res.body).to.not.be.ok;
          done();
        });
      });
    });
  });

  describe('User editing validation', () => {

  });
});
