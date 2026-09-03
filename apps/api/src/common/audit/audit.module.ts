import { Global, Module } from "@nestjs/common";
import { AuditService } from "./audit.service";

// @Global so every feature module can inject AuditService without
// re-importing this module everywhere — see docs/admin/AUDIT_LOGS.md.
@Global()
@Module({
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
