import { PrismaClient } from "@prisma/client";
import { SYSTEM_PROMPTS } from "../src/lib/prompts";

const prisma = new PrismaClient();

async function main() {
  await prisma.prompt.deleteMany({ where: { scope: "system" } });
  await prisma.prompt.createMany({
    data: SYSTEM_PROMPTS.map((prompt) => ({
      scope: "system",
      category: prompt.category,
      title: prompt.title,
      body: prompt.body,
      videoHint: prompt.videoHint,
    })),
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
