
import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

const Schema = mongoose.Schema;

const accountSchema = new Schema({
  username: { type: 'String', required: true },
  password: { type: 'String', required: true },
});

accountSchema.plugin(passportLocalMongoose);

export default mongoose.model('Account', accountSchema);
