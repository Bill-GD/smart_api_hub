import express from 'express';
import morgan from 'morgan';
import { runMigration } from './database/migrate';


(async () => await runMigration('./schema.json'))();

const app = express();

app.use(morgan('dev'));
app.use(express.json());


const port = process.env.PORT || 2000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
