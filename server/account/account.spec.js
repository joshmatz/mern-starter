
// import mocha from 'mocha';
import app from '../server';
// import chai from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
// import Account from './account.model';
// import Post from '../post/post.model';

let cookies;

function connectDB(done) {
  // if (mongoose.connection.name !== 'mern-test') {
  //   return done();
  // }

  mongoose.connect((process.env.MONGO_URL || 'mongodb://localhost:27017/mern-test'), (err) => {
    if (err) {
      console.log('err: ', err);
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
        // console.log("res.headers['set-cookie']: ", res.headers['set-cookie'].pop().split(';')[0]);
        // console.log('cookies: ', cookies);
        // console.log('res.body: ', res.body);
        // expect(res.body.posts.length).to.equal(2);
        done();
      });
    });

    it('should have the user be logged in', (done) => {
      // req.set('Cookie', "cookieName1=cookieValue1");
      const req = request(app).get('/api/account');

      req.cookies = cookies;
      // console.log('cookies: ', cookies);

      req
      .set('Cookie', cookies)
      .set('Accept', 'application/json')
      .end((res, err) => {
        console.log('res.body: ', res.body);
        done();
      });
    });

    it('should allow the user to be logged out', (done) => {
      // req.set('Cookie', "cookieName1=cookieValue1");
      const req = request(app).get('/api/account/logout');

      req.cookies = cookies;

      req
      .set('Cookie', cookies)
      .set('Accept', 'application/json')
      .end((err, res) => {
        console.log('res.body: ', res.body);
        done();
      });
    });

    it('should allow the user to login', (done) => {
      request(app)
      .post('/api/account/login')
      .send({ email: 'foo@foo.foo', password: 'bar' })
      .end((err, res) => {
        console.log('res.body: ', res.body);
        const cookieHeaders = res.headers['set-cookie'];
        cookies = cookieHeaders.pop().split(';')[0];
        // console.log("res.headers['set-cookie']: ", res.headers['set-cookie'].pop().split(';')[0]);
        // console.log('cookies: ', cookies);
        // console.log('res.body: ', res.body);
        // expect(res.body.posts.length).to.equal(2);
        done();
      });
    });
  });
});

// describe('Account', function() {

//     before(function(done) {
//         db = mongoose.connect('mongodb://localhost/test');
//             done();
//     });

//     after(function(done) {
//         mongoose.connection.close();
//         done();
//     });

//     beforeEach(function(done) {
//         var account = new Account({
//             username: '12345',
//             password: 'testy'
//         });

//         account.save(function(error) {
//             if (error) console.log('error' + error.message);
//             else console.log('no error');
//             done();
//         });
//     });

//     it('find a user by username', function(done) {
//         Account.findOne({ username: '12345' }, function(err, account) {
//             account.username.should.eql('12345');
//             console.log("   username: ", account.username);
//             done();
//         });
//     });

//     afterEach(function(done) {
//         Account.remove({}, function() {
//             done();
//         });
//      });

// });