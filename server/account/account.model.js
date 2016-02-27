import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { isEmail } from 'validator';
import mongoosePaginate from 'mongoose-paginate';

const Schema = mongoose.Schema;

const accountSchema = new Schema({
  email: {
    type: String,
    validate: [isEmail, 'invalid email'],
    required: true,
    unique: true,
    index: true,
  },
  password: { type: String, select: false },
  name: { type: String },
  role: { type: String, enum: ['admin', 'manager', 'user'], required: true },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

function isValidPassword(password, resolve) {
  bcrypt.compare(password, this.password, (err, res) => {
    if (err) {
      return resolve(err, false);
    }

    return resolve(null, res);
  });
}

function hashPassword(next) {
  if (!this.isModified('password')) return next();

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

// accountSchema.statics.authenticate = ;

accountSchema.plugin(mongoosePaginate);

export default mongoose.model('Account', accountSchema);
