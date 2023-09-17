import express, { Request, Response } from 'express';

import { router } from '@main/routes';

const start = async () => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(router);

  app.get('/', (request: Request, response: Response) => {
    return response.status(204).send({});
  });

  app.listen(3000, () => {
    console.log(`Listening on port ${3000}`);
  });
};

start();
