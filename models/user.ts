import { User } from "@/types/user";
import { getIsoTimestr } from "@/lib/time";
import { getPgWrapperClient } from "../lib/db-wrapper";

export async function insertUser(user: User) {
  const supabase = getPgWrapperClient();
  const { data, error } = await supabase.from("users").insert(user);

  if (error) {
    throw error;
  }

  return data;
}

export async function findUserByEmail(
  email: string
): Promise<User | undefined> {
  const supabase = getPgWrapperClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .limit(1)
    .single();

  if (error) {
    return undefined;
  }

  return data;
}

export async function findUserByUuid(uuid: string): Promise<User | undefined> {
  const supabase = getPgWrapperClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("uuid", uuid)
    .single();

  if (error) {
    return undefined;
  }

  return data;
}

export async function getUsers(
  page: number = 1,
  limit: number = 50
): Promise<User[] | undefined> {
  if (page < 1) page = 1;
  if (limit <= 0) limit = 50;

  const offset = (page - 1) * limit;
  const supabase = getPgWrapperClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("createdAt", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return undefined;
  }

  return data;
}

export async function updateUserInviteCode(
  userUuid: string,
  inviteCode: string
) {
  const supabase = getPgWrapperClient();
  const updatedAt = getIsoTimestr();
  const { data, error } = await supabase
    .from("users")
    .update({ inviteCode, updatedAt })
    .eq("uuid", userUuid);

  if (error) {
    throw error;
  }

  return data;
}

export async function updateUserInvitedBy(
  userUuid: string,
  invitedBy: string
) {
  const supabase = getPgWrapperClient();
  const updatedAt = getIsoTimestr();
  const { data, error } = await supabase
    .from("users")
    .update({ invitedBy, updatedAt })
    .eq("uuid", userUuid);

  if (error) {
    throw error;
  }

  return data;
}

export async function getUsersByUuids(userUuids: string[]): Promise<User[]> {
  const supabase = getPgWrapperClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .in("uuid", userUuids);
  if (error) {
    return [];
  }

  return data as User[];
}

export async function findUserByInviteCode(inviteCode: string) {
  const supabase = getPgWrapperClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("inviteCode", inviteCode)
    .single();

  if (error) {
    return undefined;
  }

  return data;
}

export async function getUserUuidsByEmail(email: string) {
  const supabase = getPgWrapperClient();
  const { data, error } = await supabase
    .from("users")
    .select("uuid")
    .eq("email", email);
  if (error) {
    return [];
  }

  return data.map((user: User) => user.uuid);
}

export async function getUsersTotal(): Promise<number | undefined> {
  const supabase = getPgWrapperClient();
  const { data, error } = await supabase.from("users").select("count", {
    count: "exact",
  });

  if (error) {
    return undefined;
  }

  return data[0].count;
}

export async function getUserCountByDate(
  startTime: string
): Promise<Map<string, number> | undefined> {
  const supabase = getPgWrapperClient();
  let query = supabase
    .from("users")
    .select("createdAt")
    .gte("createdAt", startTime);

  query = query.order("createdAt", { ascending: true });

  const { data, error } = await query;
  if (error) {
    return undefined;
  }

  // Group by date in memory since Supabase doesn't support GROUP BY directly
  const dateCountMap = new Map<string, number>();
  data.forEach((item: User) => {
    if (item.createdAt) {
      const date = item.createdAt.split("T")[0];
      dateCountMap.set(date, (dateCountMap.get(date) || 0) + 1);
    }
  });

  return dateCountMap;
}
