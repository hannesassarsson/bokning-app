import { Router } from "express";
import { prisma } from "../prisma";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth";
import { requireAdmin } from "../middleware/requireAdmin";

export const classesRouter = Router();

const createClassSchema = z.object({
  title: z.string().min(1, "Titel krävs"),
  startTime: z.string(),
  endTime: z.string(),
  capacity: z.number().min(1, "Kapacitet måste vara minst 1"),
});

classesRouter.post(
  "/",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const parsed = createClassSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.errors[0].message,
      });
    }

    const { title, startTime, endTime, capacity } = parsed.data;

    const newClass = await prisma.class.create({
      data: {
        title,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        capacity,
      },
    });

    return res.status(201).json(newClass);
  }
);


classesRouter.get("/", async (_req, res) => {
  const classes = await prisma.class.findMany({
    orderBy: {
      startTime: "asc",
    },
  });

  res.json(classes);
});
