import { getUserEmail, getUserUuid } from "@/services/user";
import { insertOrder, updateOrderSession } from "@/models/order";
import { respData, respErr } from "@/lib/resp";

import { Order } from "@/types/order";
import Stripe from "stripe";
import { findUserByUuid } from "@/models/user";
import { getSnowId } from "@/lib/hash";
import { getPricingPage } from "@/services/page";
import { PricingItem } from "@/types/blocks/pricing";

export async function POST(req: Request) {
  try {
    let {
      credits,
      currency,
      amount,
      interval,
      productId,
      productName,
      validMonths,
      cancelUrl,
    } = await req.json();

    if (!cancelUrl) {
      cancelUrl = `${
        process.env.NEXT_PUBLIC_PAY_CANCEL_URL ||
        process.env.NEXT_PUBLIC_WEB_URL
      }`;
    }

    if (!amount || !interval || !currency || !productId) {
      return respErr("invalid params");
    }

    // validate checkout params
    const page = await getPricingPage("en");
    if (!page || !page.pricing || !page.pricing.items) {
      return respErr("invalid pricing table");
    }

    const item = page.pricing.items.find(
      (item: PricingItem) => item.productId === productId
    );

    let isPriceValid = false;

    if (currency === "cny") {
      isPriceValid = item?.cnAmount === amount;
    } else {
      isPriceValid = item?.amount === amount && item?.currency === currency;
    }

    if (
      !item ||
      !item.amount ||
      !item.interval ||
      !item.currency ||
      item.interval !== interval ||
      !isPriceValid
    ) {
      return respErr("invalid checkout params");
    }

    if (!["year", "month", "one-time"].includes(interval)) {
      return respErr("invalid interval");
    }

    const isSubscription = interval === "month" || interval === "year";

    if (interval === "year" && validMonths !== 12) {
      return respErr("invalid validMonths");
    }

    if (interval === "month" && validMonths !== 1) {
      return respErr("invalid validMonths");
    }

    const userUuid = await getUserUuid();
    if (!userUuid) {
      return respErr("no auth, please sign-in");
    }

    let userEmail = await getUserEmail();
    if (!userEmail) {
      const user = await findUserByUuid(userUuid);
      if (user) {
        userEmail = user.email;
      }
    }
    if (!userEmail) {
      return respErr("invalid user");
    }

    const orderNo = getSnowId();

    const currentDate = new Date();
    const createdAt = currentDate.toISOString();

    let expiredAt = "";

    const timePeriod = new Date(currentDate);
    timePeriod.setMonth(currentDate.getMonth() + validMonths);

    const timePeriodMillis = timePeriod.getTime();
    let delayTimeMillis = 0;

    // subscription
    if (isSubscription) {
      delayTimeMillis = 24 * 60 * 60 * 1000; // delay 24 hours expired
    }

    const newTimeMillis = timePeriodMillis + delayTimeMillis;
    const newDate = new Date(newTimeMillis);

    expiredAt = newDate.toISOString();

    const order: Order = {
      orderNo: orderNo,
      createdAt: createdAt,
      userUuid: userUuid,
      userEmail: userEmail,
      amount: amount,
      interval: interval,
      expiredAt: expiredAt,
      status: "created",
      credits: credits,
      currency: currency,
      productId: productId,
      productName: productName,
      validMonths: validMonths,
    };
    await insertOrder(order);

    const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY || "");

    let options: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: productName,
            },
            unit_amount: amount,
            recurring: isSubscription
              ? {
                  interval: interval,
                }
              : undefined,
          },
          quantity: 1,
        },
      ],
      allow_promotion_codes: true,
      metadata: {
        project: process.env.NEXT_PUBLIC_PROJECT_NAME || "",
        productName: productName,
        orderNo: orderNo.toString(),
        userEmail: userEmail,
        credits: credits,
        userUuid: userUuid,
      },
      mode: isSubscription ? "subscription" : "payment",
      success_url: `${process.env.NEXT_PUBLIC_WEB_URL}/pay-success/{CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
    };

    if (userEmail) {
      options.customer_email = userEmail;
    }

    if (isSubscription) {
      options.subscription_data = {
        metadata: options.metadata,
      };
    }

    if (currency === "cny") {
      options.payment_method_types = ["wechat_pay", "alipay", "card"];
      options.payment_method_options = {
        wechat_pay: {
          client: "web",
        },
        alipay: {},
      };
    }

    const orderDetail = JSON.stringify(options);

    const session = await stripe.checkout.sessions.create(options);

    const stripeSessionId = session.id;
    await updateOrderSession(orderNo, stripeSessionId, orderDetail);

    return respData({
      publicKey: process.env.STRIPE_PUBLIC_KEY,
      orderNo: orderNo,
      sessionId: stripeSessionId,
    });
  } catch (e: any) {
    console.log("checkout failed: ", e);
    return respErr("checkout failed: " + e.message);
  }
}
