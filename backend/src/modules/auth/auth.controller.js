import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma.js";
import { env } from "../../config/env.js";
import { HttpError } from "../../utils/httpError.js";
import { publicUser } from "../../utils/formatters.js";

function createToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    env.jwtSecret,
    { expiresIn: "7d" },
  );
}

export async function signup(req, res) {
  const { name, email, password } = req.validated.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new HttpError(409, "Email is already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  res.status(201).json({
    token: createToken(user),
    user: publicUser(user),
  });
}

export async function login(req, res) {
  const { email, password } = req.validated.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new HttpError(401, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new HttpError(401, "Invalid email or password");
  }

  res.json({
    token: createToken(user),
    user: publicUser(user),
  });
}

export async function me(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
  });

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  res.json({ user: publicUser(user) });
}

