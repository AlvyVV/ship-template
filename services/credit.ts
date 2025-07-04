import { findCreditByOrderNo, getUserValidCredits, insertCredit, getCreditsByUserUuid } from '@/models/credit';

import { Credit } from '@/types/credit';
import { Order } from '@/types/order';
import { UserCredits } from '@/types/user';
import { findUserByUuid } from '@/models/user';
import { getFirstPaidOrderByUserUuid } from '@/models/order';
import { getIsoTimestr } from '@/lib/time';
import { getSnowId } from '@/lib/hash';
import { apiClient } from '@/lib/api-client';

export enum CreditsTransType {
  NewUser = 'new_user', // initial credits for new user
  OrderPay = 'order_pay', // user pay for credits
  OrderRefund = 'order_refund', // user refund for credits
  SystemAdd = 'system_add', // system add credits
  Image2Image = 'image_2_image', // image to image
  Ping = 'ping', // cost for ping api
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
    // 调用 vv-api 获取当前用户积分汇总
    const summaryRes = await apiClient.get<any>('/console/credit-records/summary');

    // vv-api 返回格式：{ status: 'success', data: { totalBalance: number, frozenBalance: number } }
    const totalBalance: number = summaryRes?.data?.totalBalance ?? 0;
    const frozenBalance: number = summaryRes?.data?.frozenBalance ?? 0;

    userCredits.leftCredits = totalBalance - frozenBalance;

    if (userCredits.leftCredits < 0) {
      userCredits.leftCredits = 0;
    }

    // 判断是否 PRO
    if (userCredits.leftCredits > 0) {
      userCredits.isPro = true;
    }

    // 是否充值过（保持原有逻辑）
    const firstPaidOrder = await getFirstPaidOrderByUserUuid(userUuid);
    if (firstPaidOrder) {
      userCredits.isRecharged = true;
    }

    return userCredits;
  } catch (e) {
    console.log('get user credits failed: ', e);
    return userCredits;
  }
}

export async function decreaseCredits({ userUuid, transType, credits }: { userUuid: string; transType: CreditsTransType; credits: number }) {
  try {
    let orderNo = '';
    let expiredAt = '';
    let leftCredits = 0;

    const userCredits = await getUserValidCredits(userUuid);
    if (userCredits) {
      for (let i = 0, l = userCredits.length; i < l; i++) {
        const credit = userCredits[i];
        leftCredits += credit.credits;

        // credit enough for cost
        if (leftCredits >= credits) {
          orderNo = credit.orderNo;
          expiredAt = credit.expiredAt || '';
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
    console.log('decrease credits failed: ', e);
    throw e;
  }
}

export async function increaseCredits({ userUuid, transType, credits, expiredAt, orderNo }: { userUuid: string; transType: string; credits: number; expiredAt?: string; orderNo?: string }) {
  try {
    const newCredit: Credit = {
      transNo: getSnowId(),
      createdAt: getIsoTimestr(),
      userUuid: userUuid,
      transType: transType,
      credits: credits,
      orderNo: orderNo || '',
      expiredAt: expiredAt || '',
    };
    await insertCredit(newCredit);
  } catch (e) {
    console.log('increase credits failed: ', e);
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
    console.log('update credit for order failed: ', e);
    throw e;
  }
}

export async function getUserCreditRecords(userUuid: string, page: number = 1, limit: number = 50) {
  try {
    // 调用 vv-api 获取用户积分流水记录
    const response = await apiClient.get<any>(`/console/credit-records?page=${page}&limit=${limit}`);

    // vv-api 返回格式: { status: 'success', data: { items: [...], total: number, page: number, limit: number } }
    const payload = response?.data || {};
    console.log('getUserCreditRecords payload', payload);
    return {
      items: payload.items || [],
      total: payload.total ?? 0,
      page: payload.page ?? page,
      limit: payload.limit ?? limit,
    };
  } catch (error) {
    console.error('getUserCreditRecords failed:', error);
    return {
      items: [],
      total: 0,
      page,
      limit,
    };
  }
}
