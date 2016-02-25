import Express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import path from 'path';
import boom from 'express-boom';
import expressValidator from 'express-validator';

// Auth
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import Account from './account/account.model';


// Webpack Requirements
import webpack from 'webpack';
import config from '../webpack.config.dev';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

// React And Redux Setup
import { configureStore } from '../shared/redux/store/configureStore';
import { Provider } from 'react-redux';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { match, RouterContext } from 'react-router';

// Import required modules
import routes from '../shared/routes';
import { fetchComponentData } from './util/fetchData';
import migrations from './migrations';
import serverConfig from './config';

// routes
import postRoutes from './post/post.routes';
import accountRoutes from './account/account.routes';
import accountsRoutes from './accounts/accounts.routes';

// Initialize the Express App
const app = new Express();

if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  const compiler = webpack(config);
  app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }));
  app.use(webpackHotMiddleware(compiler));
}

if (process.env.NODE_ENV !== 'test') {
  // MongoDB Connection
  mongoose.connect(serverConfig.mongoURL, (error) => {
    if (error) {
      console.error('Please make sure Mongodb is installed and running!'); // eslint-disable-line
      throw error;
    }

    // Set up database with any migrations necessary
    migrations();
  });
}

// Apply body Parser and server public assets and routes
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }));
app.use(expressValidator());
app.use(Express.static(path.resolve(__dirname, '../static')));
app.use(boom());


// Auth and Passport Setup
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
}));

passport.use(new LocalStrategy({ usernameField: 'email', passReqToCallback: true }, (req, email, password, done) => {
  Account.findOne({ email }, '+password', (err, user) => {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(null, false);
    }

    return user.isValidPassword(password).then((isValid) => {
      if (isValid) {
        done(null, user);
      } else {
        done(null, false);
      }
    });
  });
}));

passport.serializeUser((account, done) => {
  done(null, account._id );
});
passport.deserializeUser((session, done) => {
  Account.findById(session, (err, account) => {
    done(err, account);
  });
});

app.use(passport.initialize());
app.use(passport.session());

// Other API routes
app.use('/api', (req, res, next) => {
  req.accepts('application/json');
  res.contentType('application/json');
  next();
});
app.use('/api', postRoutes);
app.use('/api', accountRoutes);
app.use('/api', accountsRoutes);

// Render Initial HTML
const renderFullPage = (html, initialState) => {
  const cssPath = process.env.NODE_ENV === 'production' ? '/css/app.min.css' : '/css/app.css';
  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>MERN Starter - Blog App</title>
        <link rel="stylesheet" href=${cssPath} />
        <link href='https://fonts.googleapis.com/css?family=Lato:400,300,700' rel='stylesheet' type='text/css'/>
        <link rel="shortcut icon" href="http://res.cloudinary.com/hashnode/image/upload/v1455629445/static_imgs/mern/mern-favicon-circle-fill.png" type="image/png" />
      </head>
      <body>
        <div id="root">${html}</div>
        <script>
          window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
        </script>
        <script src="/dist/bundle.js"></script>
      </body>
    </html>
  `;
};

if (process.env.NODE_ENV === 'test') {
  // Server Side Rendering based on routes matched by React-router.
  app.use((req, res) => {
    match({ routes, location: req.url }, (err, redirectLocation, renderProps) => {
      if (err) {
        return res.status(500).end('Internal server error');
      }

      if (!renderProps) {
        return res.status(404).end('Not found!');
      }

      const initialState = { posts: [], post: {} };

      const store = configureStore(initialState);

      fetchComponentData(store.dispatch, renderProps.components, renderProps.params)
        .then(() => {
          const initialView = renderToString(
            <Provider store={store}>
              <RouterContext {...renderProps} />
            </Provider>
          );
          const finalState = store.getState();

          res.status(200).end(renderFullPage(initialView, finalState));
        })
        .catch(() => {
          res.end(renderFullPage('Error', {}));
        });
    });
  });
}

// start app
app.listen(serverConfig.port, (error) => {
  if (!error) {
    console.log(`MERN is running on port: ${serverConfig.port}! Build something amazing!`); // eslint-disable-line
  }
});

export default app;
