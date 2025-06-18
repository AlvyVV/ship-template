import {
  findUserByInviteCode,
  findUserByUuid,
  updateUserInviteCode,
} from "@/models/user";
import { respData, respErr } from "@/lib/resp";

import { getUserUuid } from "@/services/user";

export async function POST(req: Request) {
  try {
    const { inviteCode } = await req.json();
    if (!inviteCode) {
      return respErr("invalid params");
    }

    if (inviteCode.length < 2 || inviteCode.length > 16) {
      return respErr("invalid invite code, length must be between 2 and 16");
    }

    const userUuid = await getUserUuid();
    if (!userUuid) {
      return respErr("no auth");
    }

    const userInfo = await findUserByUuid(userUuid);
    if (!userInfo || !userInfo.email) {
      return respErr("invalid user");
    }

    if (userInfo.inviteCode === inviteCode) {
      return respData(userInfo);
    }

    const userByInviteCode = await findUserByInviteCode(inviteCode);
    if (userByInviteCode) {
      if (userByInviteCode.uuid !== userUuid) {
        return respErr("invite code already exists");
      }

      return respData(userByInviteCode);
    }

    await updateUserInviteCode(userUuid, inviteCode);

    userInfo.inviteCode = inviteCode;

    return respData(userInfo);
  } catch (e) {
    console.log("update invite code failed", e);
    return respErr("update invite code failed");
  }
}
