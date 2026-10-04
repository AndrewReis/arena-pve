import { buildApp } from './app';

const server = buildApp({ enableStatic: true });

const start = async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Servidor rodando em http://localhost:3000');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

void start();
