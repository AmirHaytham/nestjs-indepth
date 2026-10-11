// Not part of the app. Run with: npm run peek
// Prints what @Roles and @Public stored, which is all the guard ever reads.
import 'reflect-metadata';
import { UsersController } from './users/users.controller.js';
import { ReportsController } from './reports/reports.controller.js';
import { ROLES_KEY } from './auth/roles.decorator.js';
import { IS_PUBLIC_KEY } from './auth/public.decorator.js';

const controllers = [UsersController, ReportsController];

for (const controller of controllers) {
  console.log(`${controller.name}`);
  console.log(`  on the class    roles = ${JSON.stringify(Reflect.getMetadata(ROLES_KEY, controller))}`);
  for (const name of Object.getOwnPropertyNames(controller.prototype)) {
    if (name === 'constructor') continue;
    const handler = (controller.prototype as any)[name];
    const roles = Reflect.getMetadata(ROLES_KEY, handler);
    const isPublic = Reflect.getMetadata(IS_PUBLIC_KEY, handler);
    console.log(
      `  ${name.padEnd(15)} roles = ${JSON.stringify(roles)}${isPublic ? '   isPublic = true' : ''}`,
    );
  }
  console.log();
}

console.log('undefined means "nothing stored here". getAllAndOverride checks the');
console.log('method first and falls back to the class, which is why /reports/mine');
console.log('lets students in while /reports/grades does not.');
