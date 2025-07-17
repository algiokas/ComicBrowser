import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { json, urlencoded, Request, Response, NextFunction, RequestHandler } from 'express';
import createError, { HttpError } from 'http-errors';
import logger from 'morgan';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

import apiRouter from '../api/src/routes/api';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(cors());
app.options('*', cors());

app.use(logger('dev') as RequestHandler);
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser() as RequestHandler);
app.use('/data', express.static(path.join(__dirname, 'data')));
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(createError(404));
});

// error handler
app.use((err: HttpError, req: Request, res: Response, _next: NextFunction) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  
  const errorMessage = err.status === 404 ? "Not Found" : "Internal Server Error"
  res.status(err.status || 500).send({ error: errorMessage });
});

export default app;
