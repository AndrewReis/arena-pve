import { app } from '@/app';

const start = async () => {
  try {
    const port = 3000;
    await app.listen({ port: port, host: '0.0.0.0' });
    console.log(`Servidor rodando em http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();