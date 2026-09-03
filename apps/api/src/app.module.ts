import { Module } from "@nestjs/common";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { getEnv } from "@clip/config";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

@Module({
  imports: [
    // Registered globally so JwtAuthGuard (also global) can inject JwtService.
    JwtModule.registerAsync({
      global: true,
      useFactory: () => {
        const env = getEnv();
        return { secret: env.AUTH_SECRET, signOptions: { expiresIn: env.AUTH_ACCESS_TOKEN_TTL } };
      },
    }),
    AuthModule,
    UsersModule,
  ],
  providers: [
    // Two-layer guard model — see docs/api/API_AUTHORIZATION.md.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
