import {
  CreditsTransType,
  increaseCredits,
  updateCreditForOrder,
} from "./credit";
import { findOrderByOrderNo, updateOrderStatus } from "@/models/order";
import { getIsoTimestr, getOneYearLaterTimestr } from "@/lib/time";

import Stripe from "stripe";
import { updateAffiliateForOrder } from "./affiliate";

export async function handleOrderSession(session: Stripe.Checkout.Session) {
  try {
    if (
      !session ||
      !session.metadata ||
      !session.metadata.orderNo ||
      session.payment_status !== "paid"
    ) {
      throw new Error("invalid session");
    }

    const orderNo = session.metadata.orderNo;
    const paidEmail =
      session.customer_details?.email || session.customer_email || "";
    const paidDetail = JSON.stringify(session);

    const order = await findOrderByOrderNo(orderNo);
    if (!order || order.status !== "created") {
      throw new Error("invalid order");
    }

    const paidAt = getIsoTimestr();
    await updateOrderStatus(orderNo, "paid", paidAt, paidEmail, paidDetail);

    if (order.userUuid) {
      if (order.credits > 0) {
        // increase credits for paied order
        await updateCreditForOrder(order);
      }

      // update affiliate for paied order
      await updateAffiliateForOrder(order);
    }

    console.log(
      "handle order session successed: ",
      orderNo,
      paidAt,
      paidEmail,
      paidDetail
    );
  } catch (e) {
    console.log("handle order session failed: ", e);
    throw e;
  }
}
