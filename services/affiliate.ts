import { findAffiliateByOrderNo, insertAffiliate } from "@/models/affiliate";

import { AffiliateRewardAmount } from "./constant";
import { AffiliateRewardPercent } from "./constant";
import { AffiliateStatus } from "./constant";
import { Order } from "@/types/order";
import { findUserByUuid } from "@/models/user";
import { getIsoTimestr } from "@/lib/time";

export async function updateAffiliateForOrder(order: Order) {
  try {
    const user = await findUserByUuid(order.userUuid);
    if (user && user.uuid && user.invitedBy && user.invitedBy !== user.uuid) {
      const affiliate = await findAffiliateByOrderNo(order.orderNo);
      if (affiliate) {
        return;
      }

      await insertAffiliate({
        userUuid: user.uuid,
        invitedBy: user.invitedBy,
        createdAt: getIsoTimestr(),
        status: AffiliateStatus.Completed,
        paidOrderNo: order.orderNo,
        paidAmount: order.amount,
        rewardPercent: AffiliateRewardPercent.Paied,
        rewardAmount: AffiliateRewardAmount.Paied,
      });
    }
  } catch (e) {
    console.log("update affiliate for order failed: ", e);
    throw e;
  }
}
