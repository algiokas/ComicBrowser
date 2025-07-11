import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { json, urlencoded, Request, Response, NextFunction, RequestHandler } from 'express';
import createError, { HttpError } from 'http-errors';
import logger from 'morgan';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

import apiRouter from '../api/src/routes/api';
import indexRouter from '../api/src/routes/index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cors());
app.options('*', cors());

app.use(logger('dev') as RequestHandler);
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser() as RequestHandler);
app.use('/data', express.static(path.join(__dirname, 'data')));

app.use('/', indexRouter);
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

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
