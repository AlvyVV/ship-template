import { Affiliate } from "@/types/affiliate";
import { User } from "@/types/user";
import { getPgWrapperClient } from "@/lib/db-wrapper";
import { getUsersByUuids } from "./user";

export async function insertAffiliate(affiliate: Affiliate) {
  const supabase = getPgWrapperClient();
  const { data, error } = await supabase.from("affiliates").insert(affiliate);

  if (error) {
    throw error;
  }

  return data;
}

export async function getUserAffiliates(
  userUuid: string,
  page: number = 1,
  limit: number = 50
): Promise<Affiliate[] | undefined> {
  const supabase = getPgWrapperClient();
  const { data, error } = await supabase
    .from("affiliates")
    .select("*")
    .eq("invitedBy", userUuid)
    .order("createdAt", { ascending: false })
    .range((page - 1) * limit, page * limit);

  if (error) {
    console.error("Error fetching user invites:", error);
    return [];
  }

  if (!data || data.length === 0) {
    return undefined;
  }

  const userUuids: string[] = Array.from(new Set(data.map((item: Affiliate) => item.userUuid)));

  const users = await getUsersByUuids(userUuids);
  const affiliates = data.map((item: Affiliate) => {
    const user = users.find((user) => user.uuid === item.userUuid);
    return { ...item, user };
  });

  return affiliates;
}

export async function getAffiliateSummary(userUuid: string) {
  const supabase = getPgWrapperClient();
  const { data, error } = await supabase
    .from("affiliates")
    .select("*")
    .eq("invitedBy", userUuid);

  const summary = {
    totalInvited: 0,
    totalPaid: 0,
    totalReward: 0,
  };

  if (error) {
    return summary;
  }

  const invitedUsers = new Set();
  const paidUsers = new Set();

  data.forEach((item: Affiliate) => {
    invitedUsers.add(item.userUuid);
    if (item.paidAmount > 0) {
      paidUsers.add(item.userUuid);

      summary.totalReward += item.rewardAmount;
    }
  });

  summary.totalInvited = invitedUsers.size;
  summary.totalPaid = paidUsers.size;

  return summary;
}

export async function findAffiliateByOrderNo(orderNo: string) {
  const supabase = getPgWrapperClient();
  const { data, error } = await supabase
    .from("affiliates")
    .select("*")
    .eq("paidOrderNo", orderNo)
    .single();

  if (error) {
    return undefined;
  }

  return data;
}

export async function getAllAffiliates(
  page: number = 1,
  limit: number = 50
): Promise<Affiliate[]> {
  if (page < 1) page = 1;
  if (limit <= 0) limit = 50;

  const offset = (page - 1) * limit;

  const supabase = getPgWrapperClient();
  const { data, error } = await supabase
    .from("affiliates")
    .select("*")
    .order("createdAt", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  const userUuids: string[] = Array.from(new Set(data.map((item: Affiliate) => item.userUuid)));
  const invitedByUuids: string[] = Array.from(
    new Set(data.map((item: Affiliate) => item.invitedBy))
  );

  const users = await getUsersByUuids(userUuids);
  const invitedByUsers = await getUsersByUuids(invitedByUuids);

  const affiliates = data.map((item: Affiliate) => {
    const user = users.find((user) => user.uuid === item.userUuid);
    const invitedBy = invitedByUsers.find(
      (user) => user.uuid === item.invitedBy
    );
    return { ...item, user, invitedByUser: invitedBy };
  });

  return affiliates;
}
