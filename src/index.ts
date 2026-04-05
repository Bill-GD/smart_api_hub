import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import { runMigration } from './database/migrate';

import healthRouter from './routes/health.router';
import HttpStatus from './utils/http-status';

(async () => await runMigration('./schema.json'))();

const app = express();

app.use(morgan('dev'));
app.use(express.json());

app.use('/health', healthRouter);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(HttpStatus.INTERNAL_ERROR).json({
    message: 'An error occurred',
    error: err.message,
  });
});

const port = process.env.PORT || 2000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
