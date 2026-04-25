import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { User, Task, TimeLog, Comment, TaskHistory } from './models';

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`[Config] Missing required environment variable: ${name}`);
  }
  return value ?? '';
}

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: () => {
        const dbHost = getEnv('DB_HOST');
        const dbPort = getEnv('DB_PORT');
        const dbUser = getEnv('DB_USERNAME');
        const dbPass = getEnv('DB_PASSWORD');
        const dbName = getEnv('DB_NAME');

        const missing = ['DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME']
          .filter(name => !process.env[name]);

        if (missing.length > 0) {
          throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }

        console.log('[Config] Database connecting to', dbHost);

        return {
          dialect: 'postgres',
          host: dbHost,
          port: parseInt(dbPort, 10),
          username: dbUser,
          password: dbPass,
          database: dbName,
          models: [User, Task, TimeLog, Comment, TaskHistory],
          autoLoadModels: true,
          synchronize: true,
          // sync: { force: true },
          // CAUTION
          // Warning: Using force: true will DELETE ALL DATA in your tables. Only do this if you are in development and don't mind losing your test data.

          // Change this line
          // synchronize: true,
          
          // To this
          // sync: { force: true },
          logging: false,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
