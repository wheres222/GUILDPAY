import { DeliveryType } from "@prisma/client";
import { prisma } from "../db/prisma.js";

export async function addLicenseKeysToVariant(input: {
  variantId: string;
  sellerId: string;
  values: string[];
}) {
  const variant = await prisma.productVariant.findUnique({
    where: { id: input.variantId },
    include: {
      product: {
        select: {
          sellerId: true,
          name: true
        }
      }
    }
  });

  if (!variant) throw new Error("Variant not found");
  if (variant.product.sellerId !== input.sellerId) {
    throw new Error("Variant does not belong to seller");
  }
  if (variant.deliveryType !== DeliveryType.LICENSE_KEY) {
    throw new Error("Variant delivery type is not LICENSE_KEY");
  }

  const normalized = Array.from(
    new Set(input.values.map((v) => v.trim()).filter(Boolean))
  );

  if (!normalized.length) {
    return { created: 0, duplicates: 0, available: 0 };
  }

  const existing = await prisma.licenseKey.findMany({
    where: {
      variantId: variant.id,
      value: { in: normalized }
    },
    select: { value: true }
  });

  const existingSet = new Set(existing.map((k) => k.value));
  const toCreate = normalized.filter((v) => !existingSet.has(v));

  if (toCreate.length) {
    await prisma.licenseKey.createMany({
      data: toCreate.map((value) => ({
        variantId: variant.id,
        value
      }))
    });
  }

  const available = await prisma.licenseKey.count({
    where: { variantId: variant.id, isUsed: false }
  });

  return {
    created: toCreate.length,
    duplicates: normalized.length - toCreate.length,
    available
  };
}

export async function inventorySummaryBySeller(sellerId: string) {
  const products = await prisma.product.findMany({
    where: { sellerId, isActive: true },
    include: {
      variants: {
        where: { isActive: true },
        include: {
          _count: {
            select: {
              licenseKeys: true
            }
          },
          licenseKeys: {
            where: { isUsed: false },
            select: { id: true }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      deliveryType: variant.deliveryType,
      totalLicenseKeys: variant._count.licenseKeys,
      availableLicenseKeys: variant.deliveryType === DeliveryType.LICENSE_KEY ? variant.licenseKeys.length : null
    }))
  }));
}
