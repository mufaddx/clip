import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { getEnv } from "@clip/config";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => {
        const env = getEnv();
        return {
          secret: env.AUTH_SECRET,
          signOptions: { expiresIn: env.AUTH_ACCESS_TOKEN_TTL },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
