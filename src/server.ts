import express from 'express';
import { AppDataSource } from './database/data-source';

AppDataSource.initialize().then(() => {
  const app = express();

  app.use(express.json());

  return app.listen(process.env.PORT, () => {
    console.log(`Server is runing on port ${process.env.PORT}`);
  });
});
