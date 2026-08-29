/**
 * Generates NestJS module stubs for all remaining modules.
 * Run with: node scripts/generate-stubs.mjs
 */
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const modules = [
  'auth', 'users', 'institutions', 'students', 'courses',
  'programs', 'enrollments', 'financial-aid', 'sap',
  'policies', 'rules', 'risks', 'appeals', 'notifications',
  'advisor', 'admin', 'audit', 'import-jobs', 'ai',
];

const BASE = './apps/api/src/modules';

function toPascal(name) {
  return name.split('-').map(s => s[0].toUpperCase() + s.slice(1)).join('');
}

for (const mod of modules) {
  const dir = join(BASE, mod);
  const pascal = toPascal(mod);
  
  // Skip if already has a module file
  const moduleFile = join(dir, `${mod}.module.ts`);
  if (existsSync(moduleFile)) {
    console.log(`Skipping ${mod} (already exists)`);
    continue;
  }

  mkdirSync(dir, { recursive: true });

  // Module file
  const moduleContent = `import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { ${pascal}Controller } from './${mod}.controller';
import { ${pascal}Service } from './${mod}.service';

@Module({
  imports: [JwtModule.register({ secret: process.env['JWT_SECRET'] ?? 'dev-secret' })],
  controllers: [${pascal}Controller],
  providers: [${pascal}Service],
  exports: [${pascal}Service],
})
export class ${pascal}Module {}
`;

  // Controller file
  const controllerContent = `import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard, TenantGuard } from '../../common/guards/index';
import { ${pascal}Service } from './${mod}.service';

@ApiTags('${mod}')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller({ path: '${mod}', version: '1' })
export class ${pascal}Controller {
  constructor(private readonly service: ${pascal}Service) {}

  @Get('health')
  health() {
    return { module: '${mod}', status: 'ok' };
  }
}
`;

  // Service file
  const serviceContent = `import { Injectable } from '@nestjs/common';

@Injectable()
export class ${pascal}Service {
  // TODO: Implement ${mod} service
}
`;

  writeFileSync(moduleFile, moduleContent);
  writeFileSync(join(dir, `${mod}.controller.ts`), controllerContent);
  writeFileSync(join(dir, `${mod}.service.ts`), serviceContent);

  console.log(`✓ Generated ${mod} module stub`);
}
