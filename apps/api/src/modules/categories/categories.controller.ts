import { Controller, Get } from "@nestjs/common";
import { prisma } from "@clip/db";
import { Public } from "../../common/decorators/public.decorator";

/** /v1/categories — reference data (content categories brands/clippers pick
 * from during onboarding and campaign creation, see
 * docs/database/DATABASE_SCHEMA.md `categories`). Public: it's the same
 * fixed list regardless of who's asking, nothing user-specific in it. */
@Controller("v1/categories")
export class CategoriesController {
  @Public()
  @Get()
  async list() {
    return prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, slug: true } });
  }
}
