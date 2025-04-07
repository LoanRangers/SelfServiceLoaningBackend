import 'dotenv/config';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import cors from "cors";
import cookieParser from "cookie-parser";

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
app.use(cors({ origin: "http://localhost:5173", credentials: true}))
app.use(cookieParser());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/auth', auth);
app.use('/users', users);
app.use('/items', items);
app.use('/flags', flags);
app.use('/locations', locations);
app.use('/auditlog', auditlog);

app.listen(process.env.APP_PORT, () =>
  console.log('App running at ' + process.env.APP_URL + ':' + process.env.APP_PORT)
);
