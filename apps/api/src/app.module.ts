import { Module } from "@nestjs/common";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { getEnv } from "@clip/config";
import { AuditModule } from "./common/audit/audit.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { BrandsModule } from "./modules/brands/brands.module";
import { ClippersModule } from "./modules/clippers/clippers.module";
import { WalletModule } from "./modules/wallet/wallet.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { CampaignsModule } from "./modules/campaigns/campaigns.module";
import { ReelsModule } from "./modules/reels/reels.module";
import { InstagramModule } from "./modules/instagram/instagram.module";
import { PerformanceModule } from "./modules/performance/performance.module";
import { ReferralsModule } from "./modules/referrals/referrals.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { SupportModule } from "./modules/support/support.module";
import { DisputesModule } from "./modules/disputes/disputes.module";
import { AdminModule } from "./modules/admin/admin.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { ModerationModule } from "./modules/moderation/moderation.module";
import { UploadsModule } from "./modules/uploads/uploads.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";
import { PermissionsGuard } from "./common/guards/permissions.guard";
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
    // Baseline abuse protection — see docs/architecture/SECURITY_ARCHITECTURE.md.
    // There was previously NO rate limiting anywhere in the API: login,
    // OTP verification (a 6-digit code — 900,000 possibilities), and
    // password reset were all guessable without limit. This default
    // applies globally (login/signup included, since they're @Public()
    // but still real endpoints); tighter per-route limits on the
    // brute-forceable auth endpoints are set with @Throttle() in
    // AuthController.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    AuditModule,
    AuthModule,
    UsersModule,
    BrandsModule,
    ClippersModule,
    WalletModule,
    PaymentsModule,
    CampaignsModule,
    ReelsModule,
    InstagramModule,
    PerformanceModule,
    ReferralsModule,
    NotificationsModule,
    SupportModule,
    DisputesModule,
    AdminModule,
    AnalyticsModule,
    ModerationModule,
    UploadsModule,
    CategoriesModule,
  ],
  providers: [
    // Two-layer guard model — see docs/api/API_AUTHORIZATION.md. ThrottlerGuard
    // runs first so a flooded/brute-forced route is rejected before it even
    // reaches auth/permission checks.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
