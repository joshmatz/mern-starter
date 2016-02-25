import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { isEmail } from 'validator';
import mongoosePaginate from 'mongoose-paginate';

const Schema = mongoose.Schema;

const accountSchema = new Schema({
  email: {
    type: 'String',
    validate: [isEmail, 'invalid email'],
    required: true,
    unique: true,
    index: true,
  },
  password: { type: 'String', select: false },
  name: { type: 'String' },
  role: { type: 'String', enum: ['admin', 'manager', 'user'], required: true },
});

function isValidPassword(password) {
  const promise = new Promise((resolve) => {
    bcrypt.compare(password, this.password, (bcryptError, res) => {
      if (bcryptError) {
        return resolve(false);
      }

      return resolve(res);
    });
  });

  return promise;
}

function hashPassword(next) {
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      next(err);
      return;
    }

    bcrypt.hash(this.password, salt, (hashErr, hash) => {
      if (hashErr) {
        next(hashErr);
        return;
      }

      this.password = hash;
      next();
    });
  });
}

accountSchema.pre('save', hashPassword);

accountSchema.methods.isValidPassword = isValidPassword;

accountSchema.statics.authenticate = function authenticate(req, email, password, done) {
  this.findOne({ email }, (err, user) => {
    if (err) { return done(err); }
    if (!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }
    if (!user.validPassword(password)) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    return done(null, user);
  });
};

accountSchema.plugin(mongoosePaginate);

export default mongoose.model('Account', accountSchema);
