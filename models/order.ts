import { Order } from "@/types/order";
import { getPgWrapperClient } from "@/lib/db-wrapper";

export enum OrderStatus {
  Created = "created",
  Paid = "paid",
  Deleted = "deleted",
}

export async function insertOrder(order: Order) {
  const supabase = getPgWrapperClient();
  const { data, error } = await supabase.from("orders").insert(order);

  if (error) {
    throw error;
  }

  return data;
}

export async function findOrderByOrderNo(
  orderNo: string
): Promise<Order | undefined> {
  const supabase = getPgWrapperClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("orderNo", orderNo)
    .single();

  if (error) {
    return undefined;
  }

  return data;
}

export async function getFirstPaidOrderByUserUuid(
  userUuid: string
): Promise<Order | undefined> {
  const supabase = getPgWrapperClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("userUuid", userUuid)
    .eq("status", "paid")
    .order("createdAt", { ascending: true })
    .limit(1)
    .single();

  if (error) {
    return undefined;
  }

  return data;
}

export async function getFirstPaidOrderByUserEmail(
  userEmail: string
): Promise<Order | undefined> {
  const supabase = getPgWrapperClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("userEmail", userEmail)
    .eq("status", "paid")
    .order("createdAt", { ascending: true })
    .limit(1)
    .single();

  if (error) {
    return undefined;
  }

  return data;
}

export async function updateOrderStatus(
  orderNo: string,
  status: string,
  paidAt: string,
  paidEmail: string,
  paidDetail: string
) {
  const supabase = getPgWrapperClient();
  const { data, error } = await supabase
    .from("orders")
    .update({ status, paidAt, paidDetail, paidEmail })
    .eq("orderNo", orderNo);

  if (error) {
    throw error;
  }

  return data;
}

export async function updateOrderSession(
  orderNo: string,
  stripeSessionId: string,
  orderDetail: string
) {
  const supabase = getPgWrapperClient();
  const { data, error } = await supabase
    .from("orders")
    .update({ stripeSessionId, orderDetail })
    .eq("orderNo", orderNo);

  if (error) {
    throw error;
  }

  return data;
}

export async function updateOrderSubscription(
  orderNo: string,
  subId: string,
  subIntervalCount: number,
  subCycleAnchor: number,
  subPeriodEnd: number,
  subPeriodStart: number,
  status: string,
  paidAt: string,
  subTimes: number,
  paidEmail: string,
  paidDetail: string
) {
  const supabase = getPgWrapperClient();
  const { data, error } = await supabase
    .from("orders")
    .update({
      subId,
      subIntervalCount,
      subCycleAnchor,
      subPeriodEnd,
      subPeriodStart,
      status,
      paidAt,
      subTimes,
      paidEmail,
      paidDetail,
    })
    .eq("orderNo", orderNo);

  if (error) {
    throw error;
  }

  return data;
}

export async function getOrdersByUserUuid(
  userUuid: string
): Promise<Order[] | undefined> {
  const now = new Date().toISOString();
  const supabase = getPgWrapperClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("userUuid", userUuid)
    .eq("status", "paid")
    .order("createdAt", { ascending: false });
  // .gte("expired_at", now);

  if (error) {
    return undefined;
  }

  return data;
}

export async function getOrdersByUserEmail(
  userEmail: string
): Promise<Order[] | undefined> {
  const now = new Date().toISOString();
  const supabase = getPgWrapperClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("userEmail", userEmail)
    .eq("status", "paid")
    .order("createdAt", { ascending: false });
  // .gte("expired_at", now);

  if (error) {
    return undefined;
  }

  return data;
}

export async function getOrdersByPaidEmail(
  paidEmail: string
): Promise<Order[] | undefined> {
  const now = new Date().toISOString();
  const supabase = getPgWrapperClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("paidEmail", paidEmail)
    .eq("status", "paid")
    .order("createdAt", { ascending: false });
  // .gte("expired_at", now);

  if (error) {
    return undefined;
  }

  return data;
}

export async function getPaiedOrders(
  page: number,
  limit: number
): Promise<Order[] | undefined> {
  const supabase = getPgWrapperClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("status", "paid")
    .order("createdAt", { ascending: false })
    .range((page - 1) * limit, page * limit);

  if (error) {
    return undefined;
  }

  return data;
}

export async function getPaidOrdersTotal(): Promise<number | undefined> {
  const supabase = getPgWrapperClient();
  const { data, error } = await supabase
    .from("orders")
    .select("count", { count: "exact" })
    .eq("status", "paid");

  if (error) {
    return undefined;
  }

  return data[0].count;
}

export async function getOrderCountByDate(
  startTime: string,
  status?: string
): Promise<Map<string, number> | undefined> {
  const supabase = getPgWrapperClient();
  let query = supabase
    .from("orders")
    .select("createdAt")
    .gte("createdAt", startTime);
  if (status) {
    query = query.eq("status", status);
  }
  query = query.order("createdAt", { ascending: true });

  const { data, error } = await query;
  if (error) {
    return undefined;
  }

  // Group by date in memory since Supabase doesn't support GROUP BY directly
  const dateCountMap = new Map<string, number>();
  data.forEach((item: Order) => {
    const date = item.createdAt.split("T")[0];
    dateCountMap.set(date, (dateCountMap.get(date) || 0) + 1);
  });

  return dateCountMap;
}
