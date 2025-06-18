import { Feedback } from "@/types/feedback";
import { getPgWrapperClient } from "../lib/db-wrapper";
import { getUsersByUuids } from "./user";

export async function insertFeedback(feedback: Feedback) {
  const supabase = getPgWrapperClient();
  const { data, error } = await supabase.from("feedbacks").insert(feedback);

  if (error) {
    throw error;
  }

  return data;
}

export async function findFeedbackByUuid(
  uuid: string
): Promise<Feedback | undefined> {
  const supabase = getPgWrapperClient();
  const { data, error } = await supabase
    .from("feedbacks")
    .select("*")
    .eq("uuid", uuid)
    .single();

  if (error) {
    return undefined;
  }

  return data;
}

export async function getFeedbacks(
  page: number = 1,
  limit: number = 50
): Promise<Feedback[] | undefined> {
  if (page < 1) page = 1;
  if (limit <= 0) limit = 50;

  const offset = (page - 1) * limit;
  const supabase = getPgWrapperClient();

  const { data, error } = await supabase
    .from("feedbacks")
    .select("*")
    .order("createdAt", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  const userUuids: string[] = Array.from(new Set(data.map((item: Feedback) => item.userUuid)));
  const users = await getUsersByUuids(userUuids);

  const feedbacks = data.map((item: Feedback) => {
    const user = users.find((user) => user.uuid === item.userUuid);
    return { ...item, user };
  });

  return feedbacks;
}

export async function getFeedbacksTotal(): Promise<number | undefined> {
  const supabase = getPgWrapperClient();
  const { count, error } = await supabase
    .from("feedbacks")
    .select("*", { count: "exact" });

  if (error) {
    return undefined;
  }

  return count;
}
