import { Global, Module } from '@nestjs/common';
import { initDb } from '@impact/database';

const DATABASE_TOKEN = 'DATABASE';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_TOKEN,
      useFactory: () => {
        const url =
          process.env['DATABASE_URL'] ??
          'postgresql://postgres:postgres@localhost:5432/impact';
        return initDb(url);
      },
    },
  ],
  exports: [DATABASE_TOKEN],
})
export class DatabaseModule {}

export { DATABASE_TOKEN };
