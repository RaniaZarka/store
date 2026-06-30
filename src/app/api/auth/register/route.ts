import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { name, lastName, email, password, confirmPassword } =
    await request.json();

  if (
    typeof name !== "string" ||
    typeof lastName !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof confirmPassword !== "string" ||
    !name ||
    !lastName ||
    !email ||
    !password
  ) {
    return Response.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (password !== confirmPassword) {
    return Response.json({ error: "Passwords do not match." }, { status: 400 });
  }

  if (password.length < 8) {
    return Response.json(
      { error: "Password must be at least 8 characters long." },
      { status: 400 }
    );
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return Response.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { name, lastName, email, password: hashedPassword },
  });

  return Response.json({ success: true }, { status: 201 });
}
