import {
  AffiliateRewardAmount,
  AffiliateRewardPercent,
  AffiliateStatus,
} from "@/services/constant";
import {
  findUserByInviteCode,
  findUserByUuid,
  updateUserInvitedBy,
} from "@/models/user";
import { respData, respErr } from "@/lib/resp";

import { getIsoTimestr } from "@/lib/time";
import { insertAffiliate } from "@/models/affiliate";

export async function POST(req: Request) {
  try {
    const { inviteCode, userUuid } = await req.json();
    if (!inviteCode || !userUuid) {
      return respErr("invalid params");
    }

    // check invite user
    const inviteUser = await findUserByInviteCode(inviteCode);
    if (!inviteUser) {
      return respErr("invite user not found");
    }

    // check current user
    const user = await findUserByUuid(userUuid);
    if (!user) {
      return respErr("user not found");
    }

    if (user.uuid === inviteUser.uuid || user.email === inviteUser.email) {
      return respErr("can't invite yourself");
    }

    if (user.invitedBy) {
      return respErr("user already has invite user");
    }

    user.invitedBy = inviteUser.uuid;

    // update invite user uuid
    await updateUserInvitedBy(userUuid, inviteUser.uuid);

    await insertAffiliate({
      userUuid: userUuid,
      invitedBy: inviteUser.uuid,
      createdAt: getIsoTimestr(),
      status: AffiliateStatus.Pending,
      paidOrderNo: "",
      paidAmount: 0,
      rewardPercent: AffiliateRewardPercent.Invited,
      rewardAmount: AffiliateRewardAmount.Invited,
    });

    return respData(user);
  } catch (e) {
    console.error("update invited by failed: ", e);
    return respErr("update invited by failed");
  }
}
