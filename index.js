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
import flagToItem from './routes/flagToItem.js';
import locations from './routes/locations.js';
import categories from './routes/categories.js';
import auth from './routes/auth.js';
import auditlog from './routes/auditlog.js';
import qrCodes from './routes/qrCodes.js';
import comments from './routes/comments.js';
import tags from './routes/tags.js';
import itemsTags from './routes/itemsTags.js';

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
const jsonParser = express.json();
const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL + ':' + process.env.FRONTEND_PORT, credentials: true }));
app.use(cookieParser());
app.use(jsonParser);

const appOptions = {
  key: fs.readFileSync('backend-key.pem'),
  cert: fs.readFileSync('backend.pem'),
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/auth', auth);
app.use('/users', users);
app.use('/items', items);
app.use('/flags', flags);
app.use('/flagToItem', flagToItem);
app.use('/flags/items', flagToItem);
app.use('/locations', locations);
app.use('/categories', categories);
app.use('/auditlog', auditlog);
app.use('/qrCodes', qrCodes);
app.use('/comments', comments);
app.use('/tags', tags);
app.use('/itemsTags', itemsTags);

const server = https.createServer(appOptions, app);

server.listen(process.env.APP_PORT, () =>
  console.log('App running at ' + process.env.APP_URL + ':' + process.env.APP_PORT)
);
