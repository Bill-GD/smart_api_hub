import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import swaggerConfig from './config/swagger.config';
import { runMigration } from './database/migrate';
import authRouter from './routes/auth.router';
import healthRouter from './routes/health.router';
import resourceRouter from './routes/resource.router';
import { generateZod } from './utils/generate-zod';
import { HttpError } from './utils/http-error';
import HttpStatus from './utils/http-status';

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerConfig));
app.use('/health', healthRouter);
app.use('/auth', authRouter);
app.use('/:resource', resourceRouter);

app.get('/', (_req, res: Response) => {
  res.status(HttpStatus.OK).send(
    '<h1>Go to <a href="/api-docs">/api-docs</a> for docs.</h1>',
  );
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  
  console.error(err);
  // @ts-ignore
  res.status(err?.statusCode ?? HttpStatus.INTERNAL_ERROR).json({ error: err.message });
});

const port = process.env.PORT || 2000;
const jsonSchemaPath = './schema.json';

async function bootstrap() {
  try {
    await runMigration(jsonSchemaPath);
  } catch (e) {
    console.log('Database not connected, skipping migration');
  }
  
  generateZod(jsonSchemaPath);
  
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

bootstrap();
