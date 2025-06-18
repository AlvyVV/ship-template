"use server";

import { headers } from "next/headers";

export async function getClientIp() {
  const h = await headers();

  const ip =
    h.get("x-real-ip") || // Reverse proxy IP
    (h.get("x-forwarded-for") || "127.0.0.1").split(",")[0]; // Standard header

  return ip;
}
