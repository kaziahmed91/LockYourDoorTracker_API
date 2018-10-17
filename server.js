import express from 'express';
import bodyParser from 'body-parser';
import {MongoClient} from 'mongodb';
import mongoose from 'mongoose';
import cors from 'cors';
import session from 'express-session';
import sharedsession from 'express-socket.io-session';
const MongoStore = require('connect-mongo')(session);
import 'dotenv/config';
import socketIo from 'socket.io';
import http from 'http';


import apiRoutes from './routes/routes';


const PORT = process.env.PORT ;
const app = express();

// Socket IO SERVER CREATION
const server = http.createServer(app);
const io = socketIo(server);

io.on("connection", socket => {
    console.log("New client connected");
    console.log('socket sessoin ', socket.request.session.userId);

    // setInterval(
    //   () => getApiAndEmit(socket),
    //   10000
    // );
    // socket.on("login", function(userdata) {
    //     console.log('login user data',userdata);
    //     socket.handshake.session.userdata = userdata;
    //     socket.handshake.session.save();
    // });
    // socket.on("logout", function(userdata) {
    //     console.log('logout user data',userdata);
    //     if (socket.handshake.session.userdata) {
    //         delete socket.handshake.session.userdata;
    //         socket.handshake.session.save();
    //     }
    // }); 
    socket.on("disconnect", () => console.log("Client disconnected"));
});



// Connect to Mongoose and set connection variable
mongoose.connect('mongodb://localhost/lockyourdoor');
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log('db is connected'));


//use sessions for tracking logins
const appSessionVariables = session({
    secret: 'superSecretDontTell',
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: 60000 },
    store: new MongoStore({
      mongooseConnection: db
    })
});
app.use(appSessionVariables);

// Share the session with socket IO so we know when user loggs in 
// io.use(sharedsession(appSessionVariables, {
//     autoSave:true
// })); 

io.use( (socket, next) =>{
    appSessionVariables(socket.request, socket.request.res, next)
})


app.use(cors('*'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/', apiRoutes)

server.listen(PORT, (err) => {
    if (err) {
        throw err
    } else {
        console.log(`Listening on port ${PORT}`);
    }
});