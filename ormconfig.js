require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
const sns = require('typeorm-naming-strategies');

module.exports = {
  type: 'postgres',
  host: process.env.WILSON_DB_HOST || 'localhost',
  port: +process.env.WILSON_DB_PORT || 5432,
  username: process.env.WILSON_DB_USERNAME || 'Admin',
  password: process.env.WILSON_DB_PASSWORD || 'wilson',
  database: process.env.WILSON_DB_DBNAME || 'wilson',
  charset: 'utf8mb4',
  synchronize: false,
  logging: true,
  entities: ['./**/*.entity{.ts,.js}'],
  migrations: [`./migration/**/*`],
  cli: {
    entitiesDir: `./**/entities`,
    migrationsDir: `./migration`,
  },
  namingStrategy: new sns.SnakeNamingStrategy(),
  connectTimeout: 180000,
};
