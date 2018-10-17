import express from 'express';
import bodyParser from 'body-parser';∫
import mongoose from 'mongoose';
import cors from 'cors';
import session from 'express-session';
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

// Connect session variables with socket IO to access session in request.
io.use( (socket, next) =>{
    appSessionVariables(socket.request, socket.request.res, next)
});

io.on("connection", socket => {
    console.log("New client connected");
    console.log(socket.request.session) // Unfortunately USERID is not being passed in here as mentined in the email.
    socket.on("disconnect", () => console.log("Client disconnected"));
});

// TODO -> this would recieve incoming lat-long coordinates and take action. 
io.on('track', socket => {
    let awayLat = socket.latitude; 
    let awayLong = socket.longtiture; 
})

// Register Middlewares
app.use(cors('*'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/', apiRoutes)

export default io;

server.listen(PORT, (err) => {
    if (err) {
        throw err
    } else {
        console.log(`Listening on port ${PORT}`);
    }
});
