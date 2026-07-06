import { registerUser } from "@/services/userService";
import { ServiceError } from "@/services/ServiceError";

export async function POST(request: Request) {
  const { name, lastName, email, password, confirmPassword } =
    await request.json();

  if (
    typeof name !== "string" ||
    typeof lastName !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof confirmPassword !== "string"
  ) {
    return Response.json({ error: "Missing required fields." }, { status: 400 });
  }

  try {
    await registerUser(name, lastName, email, password, confirmPassword);
    return Response.json({ success: true }, { status: 201 });
  } catch (err) {
    if (err instanceof ServiceError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
