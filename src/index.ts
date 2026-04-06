import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import { runMigration } from './database/migrate';

import healthRouter from './routes/health.router';
import resourceRouter from './routes/resource.router';
import HttpStatus from './utils/http-status';
import { HttpError } from './utils/types';

const app = express();

app.use(morgan('dev'));
app.use(express.json());

app.use('/health', healthRouter);
app.use('/:resource', resourceRouter);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  
  console.error(err);
  res.status(HttpStatus.INTERNAL_ERROR).json({ error: err.message });
});

const port = process.env.PORT || 2000;

async function bootstrap() {
  try {
    await runMigration('./schema.json');
  } catch (e) {
    console.log('Database not connected, skipping migration');
  }
  
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

bootstrap();
