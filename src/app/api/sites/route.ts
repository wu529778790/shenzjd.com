import { NextResponse } from "next/server";
import {
  getSites,
  addSite,
  updateSite,
  deleteSite,
  addCategory,
  updateCategory,
  deleteCategory,
  type Site,
  type SiteCategory,
  updateSites,
} from "@/lib/sites";
import { categorySchema, siteSchema } from "@/lib/validations/site";
import { z } from "zod";

const postRequestSchema = z.object({
  type: z.enum(["addSite", "addCategory"]),
  data: z.union([
    z.object({
      categoryId: z.string(),
      site: siteSchema,
    }),
    categorySchema,
  ]),
});

export async function GET() {
  try {
    const sites = await getSites();
    return NextResponse.json(sites);
  } catch (error) {
    console.error("Error in GET /api/sites:", error);
    return NextResponse.json({ error: "Failed to get sites" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = postRequestSchema.parse(body);
    const { type, data } = validatedData;

    switch (type) {
      case "addSite": {
        const siteData = data as { categoryId: string; site: Site };
        const { categoryId, site } = siteData;
        await addSite(categoryId, site);
        break;
      }
      case "addCategory": {
        const category = data as SiteCategory;
        await addCategory(category);
        break;
      }
      default:
        return NextResponse.json(
          { error: "Invalid operation type" },
          { status: 400 }
        );
    }

    const sites = await getSites();
    return NextResponse.json(sites);
  } catch (error) {
    console.error("Error in POST /api/sites:", error);
    return NextResponse.json(
      { error: "Failed to perform operation" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    switch (type) {
      case "updateSite": {
        const { categoryId, siteId, site } = data;
        await updateSite(categoryId, siteId, site as Site);
        break;
      }
      case "updateCategory": {
        const { categoryId, category } = data;
        await updateCategory(categoryId, category as SiteCategory);
        break;
      }
      case "updateSites": {
        await updateSites(data as SiteCategory[]);
        break;
      }
      default:
        return NextResponse.json(
          { error: "Invalid operation type" },
          { status: 400 }
        );
    }

    const sites = await getSites();
    return NextResponse.json(sites);
  } catch (error) {
    console.error("Error in PUT /api/sites:", error);
    return NextResponse.json(
      { error: "Failed to perform operation" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    switch (type) {
      case "deleteSite": {
        const { categoryId, siteId } = data;
        await deleteSite(categoryId, siteId);
        break;
      }
      case "deleteCategory": {
        const { categoryId } = data;
        await deleteCategory(categoryId);
        break;
      }
      default:
        return NextResponse.json(
          { error: "Invalid operation type" },
          { status: 400 }
        );
    }

    const sites = await getSites();
    return NextResponse.json(sites);
  } catch (error) {
    console.error("Error in DELETE /api/sites:", error);
    return NextResponse.json(
      { error: "Failed to perform operation" },
      { status: 500 }
    );
  }
}
