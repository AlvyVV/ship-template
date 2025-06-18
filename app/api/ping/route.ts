import {
  CreditsAmount,
  CreditsTransType,
  decreaseCredits,
} from "@/services/credit";
import { respData, respErr } from "@/lib/resp";

import { getUserUuid } from "@/services/user";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message) {
      return respErr("invalid params");
    }

    const userUuid = await getUserUuid();
    if (!userUuid) {
      return respErr("no auth");
    }

    // decrease credits for ping
    await decreaseCredits({
      userUuid,
      transType: CreditsTransType.Ping,
      credits: CreditsAmount.PingCost,
    });

    return respData({
      pong: `received message: ${message}`,
    });
  } catch (e) {
    console.log("test failed:", e);
    return respErr("test failed");
  }
}
