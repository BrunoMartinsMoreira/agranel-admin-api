/* eslint-disable no-console */
import { AppDataSource } from './infra/database/data-source';
import app from './infra/http/app';

AppDataSource.initialize().then(() => {
  console.log('Database in on fire');
  return app.listen(process.env.PORT, () => {
    console.log(`Server is runing on port ${process.env.PORT}`);
  });
});
