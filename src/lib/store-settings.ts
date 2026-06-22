import { db } from "@/lib/db";

export async function getStoreSettings() {
  let settings = await db.storeSettings.findUnique({
    where: { id: "default" },
  });

  if (!settings) {
    settings = await db.storeSettings.create({
      data: { id: "default" },
    });
  }

  return settings;
}
