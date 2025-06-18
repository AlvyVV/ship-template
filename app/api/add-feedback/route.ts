import { respData, respErr } from "@/lib/resp";

import { Feedback } from "@/types/feedback";
import { getIsoTimestr } from "@/lib/time";
import { getUserUuid } from "@/services/user";
import { insertFeedback } from "@/models/feedback";

export async function POST(req: Request) {
  try {
    let { content, rating } = await req.json();
    if (!content) {
      return respErr("invalid params");
    }

    const userUuid = await getUserUuid();

    const feedback: Feedback = {
      userUuid: userUuid,
      content: content,
      rating: rating,
      createdAt: getIsoTimestr(),
      status: "created",
    };

    await insertFeedback(feedback);

    return respData(feedback);
  } catch (e) {
    console.log("add feedback failed", e);
    return respErr("add feedback failed");
  }
}
