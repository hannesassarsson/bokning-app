import express from "express";
import cors from "cors";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "bokning-backend" });
});


import { prisma } from "./prisma";

app.get("/users", async (_req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});


import { authRouter } from "./routes/auth";

app.use("/auth", authRouter);



import { requireAuth, AuthRequest } from "./middleware/requireAuth";

app.get("/me", requireAuth, (req: AuthRequest, res) => {
  res.json({
    user: req.user,
  });
});


import { classesRouter } from "./routes/classes";

app.use("/classes", classesRouter);
