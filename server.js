'use strict';
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');
const jsonParser = require('body-parser');


const { router: usersRouter } = require('./users');
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require('./config');
const { Visited, Favorited, Comment} = require("./models");

const app = express();

// Logging
app.use(morgan('common'));
//body parser
app.use(jsonParser.json());

// CORS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  }
  next();
});

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);


const jwtAuth = passport.authenticate('jwt', { session: false });

// A protected endpoint which needs a valid JWT to access it
app.get('/api/protected', jwtAuth, (req, res) => {
  return res.json({
    data: 'rosebud'
  });
});

//GET requests to /visited
app.get("/api/visited", jwtAuth, (req, res) => {
  Visited.find()
    // success callback: for each restaurant we got back, we'll
    // call the `.serialize` instance method we've created in
    // models.js in order to only expose the data we want the API return.
    .then(visit => {
      res.json({
        visit
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});
//protected Visited put endpoint
//post to visited endpoint
app.post("/api/visited", jwtAuth, (req, res) => {
  const requiredFields = ["parkId", "visited", "date", "userId"];
  requiredFields.forEach(field => {
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  });
  Visited
  .create({
    parkId: req.body.parkId,
    visited: req.body.visited,
    date: req.body.date, 
    userId: req.body.userId

  })
  .then(visits => 
    {
      console.log(visits)
      res.status(201).json({
        parkId: visits.parkId,
        visited: visits.visited,
        date: visits.date,
        userId: visits.userId
      })
    })
  .catch(err => {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong here line 82' });
  });
});


// GET requests to /favorited
app.get("/api/favorited", jwtAuth, (req, res) => {
  Favorited.find()
    // success callback: for each restaurant we got back, we'll
    // call the `.serialize` instance method we've created in
    // models.js in order to only expose the data we want the API return.
    .then(favorite => {
      res.json({
        favorite
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

// post  to favorited endpoint
app.post("/api/favorited", jwtAuth, (req, res) => {
  const requiredFields = ["parkId", "favorited", "userId"];
  console.log(req.body);
  requiredFields.forEach(field => {
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  });

  // usersRouter
  //   .findById(req.body.userId)
  //   .then(user => {
  //     console.log(user)
  //     if (user) {
  //       Favorited
  //         .create({
  //           parkId: req.body.parkId,
  //           favorited: req.body.favorited,
  //           userId: req.body.userId
  //         })
  //         .then(favorites => 
  //         {
  //           console.log(favorites)
  //           res.status(201).json({
  //           parkId: favorites.parkId,
  //           favorited: favorites.favorited,
  //           userId: favorites.userId
  //         })
  //       })
  //         .catch(err => {
  //           console.error(err);
  //           res.status(500).json({ error: 'Something went wrong here' });
  //         });
  //     }
  //     else {
  //       const message = `Author not found`;
  //       console.error(message);
  //       return res.status(400).send(message);
  //     }
  //   })
      Favorited
      .create({
            parkId: req.body.parkId,
            favorited: req.body.favorited,
            userId: req.body.userId
      })
      .then(favorites => 
          {
            console.log(favorites)
            res.status(201).json({
            parkId: favorites.parkId,
            favorited: favorites.favorited,
            userId: favorites.userId
            })
          })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went horribly awry' });
    });
});

app.use('*', (req, res) => {
  return res.status(404).json({ message: 'Not Found' });
});

// Referenced by both runServer and closeServer. closeServer
// assumes runServer has run and set `server` to a server object
let server;

function runServer(databaseUrl, port = PORT) {

  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
