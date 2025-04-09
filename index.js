import 'dotenv/config';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import https from 'https';

import users from './routes/users.js';
import items from './routes/items.js';
import flags from './routes/flags.js';
import locations from './routes/locations.js';
import auth from './routes/auth.js';
import auditlog from './routes/auditlog.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Self-service Loaning',
      version: '0.1.0',
    },
  },
  apis: ['./index.js', './routes/*'],
};
const swaggerSpec = swaggerJsdoc(options);

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL + ':' + process.env.FRONTEND_PORT, credentials: true }));
app.use(cookieParser());

const appOptions = {
  key: fs.readFileSync('backend-key.pem'),
  cert: fs.readFileSync('backend.pem'),
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/auth', auth);
app.use('/users', users);
app.use('/items', items);
app.use('/flags', flags);
app.use('/locations', locations);
app.use('/auditlog', auditlog);

const server = https.createServer(appOptions, app);

server.listen(process.env.APP_PORT, () =>
  console.log('App running at ' + process.env.APP_URL + ':' + process.env.APP_PORT)
);
