import mongoose, {Schema} from 'mongoose';
import bcrypt from 'bcrypt';
import uniqueValidator  from 'mongoose-unique-validator';

let UserSchema = new Schema({
    username:{type: String , required:[true, 'password is required'], index: true, unique:true},
    password: {type: String, required: [true, 'password is required']},
    latitude: {type:Number, required: [true, 'latitude is required']}, 
    longtitude: {type:Number, required: [true, 'longtitude is required']}, 

}, {timestamps: true});

//Prettyfies validation msg
UserSchema.plugin(uniqueValidator, {
    message: '{VALUE} is already taken!',
  });

// Hash password before saving 
UserSchema.pre('save',function (next) {
    let user = this;
    bcrypt.hash(user.password, 10, (err, hash) => {
        if (err) {
            return next(err);
          }
          user.password = hash;
          next();
    })
})


// Authenticate user for logging in 
UserSchema.statics.authenticate =  (username, password, callback) => {
    User.findOne({username}).exec( async (err, user) => {
        if (err) {
            return callback(err);
        } else if (!user) {
            let err = new Error('User not found');
            err.status = 401;
            return callback(err)
        }
        const valid = await bcrypt.compare(password, user.password);
        console.log(valid)
        if (!valid ) {
            console.log('returning false')
            return callback();
        } else {
            console.log('returning true')
            return callback(null, user); 
        }

    })
}

const User = mongoose.model('User', UserSchema);

export default User
