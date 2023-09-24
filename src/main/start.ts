import express from 'express';

import { router } from '@main/routes';

const start = async () => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(router);

  app.listen(3000, () => {
    console.log(`Listening on port ${3000}`);
  });
};

start();
