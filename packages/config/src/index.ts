export const apiConfig = {
  port: parseInt(process.env.API_PORT || '3000', 10),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/taskdb',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  corsOrigins: [process.env.FRONTEND_URL || 'http://localhost:5173'],
};
