import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";
import { z } from "zod";
import { config } from "../config";

export const authRouter = Router();

/* =========================
   REGISTER
========================= */

const registerSchema = z.object({
  email: z.string().email("Ogiltig e-postadress"),
  password: z.string().min(6, "Lösenordet måste vara minst 6 tecken"),
});

authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.errors[0].message,
    });
  }

  const { email, password } = parsed.data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res.status(400).json({
      error: "Användare med denna e-post finns redan",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  return res.status(201).json({
    message: "Användare skapad",
    userId: user.id,
  });
});

/* =========================
   LOGIN
========================= */

const loginSchema = z.object({
  email: z.string().email("Ogiltig e-postadress"),
  password: z.string().min(1, "Lösenord krävs"),
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.errors[0].message,
    });
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({
      error: "Fel e-post eller lösenord",
    });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res.status(401).json({
      error: "Fel e-post eller lösenord",
    });
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    config.jwtSecret,
    {
      expiresIn: "7d",
    }
  );

  return res.json({
    token,
  });
});
