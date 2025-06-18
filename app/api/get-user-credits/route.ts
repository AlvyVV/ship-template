import { respErr, respData } from "@/lib/resp";
import { getUserCredits } from "@/services/credit";
import { getUserUuid } from "@/services/user";

export async function POST(req: Request) {
  try {
    const userUuid = await getUserUuid();
    if (!userUuid) {
      return respErr("no auth");
    }

    const credits = await getUserCredits(userUuid);

    return respData(credits);
  } catch (e) {
    console.log("get user credits failed: ", e);
    return respErr("get user credits failed");
  }
}
