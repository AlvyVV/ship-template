import {
  findCreditByOrderNo,
  getUserValidCredits,
  insertCredit,
} from "@/models/credit";

import { Credit } from "@/types/credit";
import { Order } from "@/types/order";
import { UserCredits } from "@/types/user";
import { findUserByUuid } from "@/models/user";
import { getFirstPaidOrderByUserUuid } from "@/models/order";
import { getIsoTimestr } from "@/lib/time";
import { getSnowId } from "@/lib/hash";

export enum CreditsTransType {
  NewUser = "new_user", // initial credits for new user
  OrderPay = "order_pay", // user pay for credits
  SystemAdd = "system_add", // system add credits
  Ping = "ping", // cost for ping api
}

export enum CreditsAmount {
  NewUserGet = 10,
  PingCost = 1,
}

export async function getUserCredits(userUuid: string): Promise<UserCredits> {
  let userCredits: UserCredits = {
    leftCredits: 0,
  };

  try {
    const firstPaidOrder = await getFirstPaidOrderByUserUuid(userUuid);
    if (firstPaidOrder) {
      userCredits.isRecharged = true;
    }

    const credits = await getUserValidCredits(userUuid);
    if (credits) {
      credits.forEach((v: Credit) => {
        userCredits.leftCredits += v.credits;
      });
    }

    if (userCredits.leftCredits < 0) {
      userCredits.leftCredits = 0;
    }

    if (userCredits.leftCredits > 0) {
      userCredits.isPro = true;
    }

    return userCredits;
  } catch (e) {
    console.log("get user credits failed: ", e);
    return userCredits;
  }
}

export async function decreaseCredits({
  userUuid,
  transType,
  credits,
}: {
  userUuid: string;
  transType: CreditsTransType;
  credits: number;
}) {
  try {
    let orderNo = "";
    let expiredAt = "";
    let leftCredits = 0;

    const userCredits = await getUserValidCredits(userUuid);
    if (userCredits) {
      for (let i = 0, l = userCredits.length; i < l; i++) {
        const credit = userCredits[i];
        leftCredits += credit.credits;

        // credit enough for cost
        if (leftCredits >= credits) {
          orderNo = credit.orderNo;
          expiredAt = credit.expiredAt || "";
          break;
        }

        // look for next credit
      }
    }

    const newCredit: Credit = {
      transNo: getSnowId(),
      createdAt: getIsoTimestr(),
      userUuid: userUuid,
      transType: transType,
      credits: 0 - credits,
      orderNo: orderNo,
      expiredAt: expiredAt,
    };
    await insertCredit(newCredit);
  } catch (e) {
    console.log("decrease credits failed: ", e);
    throw e;
  }
}

export async function increaseCredits({
  userUuid,
  transType,
  credits,
  expiredAt,
  orderNo,
}: {
  userUuid: string;
  transType: string;
  credits: number;
  expiredAt?: string;
  orderNo?: string;
}) {
  try {
    const newCredit: Credit = {
      transNo: getSnowId(),
      createdAt: getIsoTimestr(),
      userUuid: userUuid,
      transType: transType,
      credits: credits,
      orderNo: orderNo || "",
      expiredAt: expiredAt || "",
    };
    await insertCredit(newCredit);
  } catch (e) {
    console.log("increase credits failed: ", e);
    throw e;
  }
}

export async function updateCreditForOrder(order: Order) {
  try {
    const credit = await findCreditByOrderNo(order.orderNo);
    if (credit) {
      // order already increased credit
      return;
    }

    await increaseCredits({
      userUuid: order.userUuid,
      transType: CreditsTransType.OrderPay,
      credits: order.credits,
      expiredAt: order.expiredAt,
      orderNo: order.orderNo,
    });
  } catch (e) {
    console.log("update credit for order failed: ", e);
    throw e;
  }
}
