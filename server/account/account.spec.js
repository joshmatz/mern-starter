
import mocha from 'mocha';
import app from '../server';
import chai from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
import Account from './account.model';
import Post from '../post/post.model';

const expect = chai.expect;

function connectDB(done) {
  if (mongoose.connection.name !== 'mern-test') {
    return done();
  }

  mongoose.connect((process.env.MONGO_URL || 'mongodb://localhost:27017/mern-test'), (err) => {
    if (err) return done(err);
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


describe('GET /api/posts', () => {
  beforeEach('connect and add two post entries', (done) => {
    connectDB(() => {
      const post1 = new Post({ name: 'Prashant', title: 'Hello Mern', content: "All cats meow 'mern!'" });
      const post2 = new Post({ name: 'Mayank', title: 'Hi Mern', content: "All dogs bark 'mern!'" });

      Post.create([post1, post2], () => {
        done();
      });
    });
  });

  afterEach((done) => {
    dropDB(done);
  });

  it('Should correctly give number of Posts', (done) => {
    request(app)
      .get('/api/posts')
      .set('Accept', 'application/json')
      .end((err, res) => {
        console.log('res: ', res);
        expect(res.body.posts.length).to.equal(2);
        done();
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