import { Credit } from "@/types/credit";
import { getPgWrapperClient } from "@/lib/db-wrapper";

export async function insertCredit(credit: Credit) {
  const supabase = getPgWrapperClient();
  const { data, error } = await supabase.from("credits").insert(credit);

  if (error) {
    throw error;
  }

  return data;
}

export async function findCreditByTransNo(
  transNo: string
): Promise<Credit | undefined> {
  const supabase = getPgWrapperClient();
  const { data, error } = await supabase
    .from("credits")
    .select("*")
    .eq("transNo", transNo)
    .limit(1)
    .single();

  if (error) {
    return undefined;
  }

  return data;
}

export async function findCreditByOrderNo(
  orderNo: string
): Promise<Credit | undefined> {
  const supabase = getPgWrapperClient();
  const { data, error } = await supabase
    .from("credits")
    .select("*")
    .eq("orderNo", orderNo)
    .limit(1)
    .single();

  if (error) {
    return undefined;
  }

  return data;
}

export async function getUserValidCredits(
  userUuid: string
): Promise<Credit[] | undefined> {
  const now = new Date().toISOString();
  const supabase = getPgWrapperClient();
  const { data, error } = await supabase
    .from("credits")
    .select("*")
    .eq("userUuid", userUuid)
    .gte("expiredAt", now)
    .order("expiredAt", { ascending: true });

  if (error) {
    return undefined;
  }

  return data;
}

export async function getCreditsByUserUuid(
  userUuid: string,
  page: number = 1,
  limit: number = 50
): Promise<Credit[] | undefined> {
  const supabase = getPgWrapperClient();
  const { data, error } = await supabase
    .from("credits")
    .select("*")
    .eq("userUuid", userUuid)
    .order("createdAt", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    return undefined;
  }

  return data;
}
