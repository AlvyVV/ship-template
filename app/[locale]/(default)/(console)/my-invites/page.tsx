import Icon from "@/components/icon";
import { getAffiliateSummary, getUserAffiliates } from "@/models/affiliate";
import { getOrdersByPaidEmail, getOrdersByUserUuid } from "@/models/order";
import { getUserEmail, getUserUuid } from "@/services/user";

import Invite from "@/components/invite";
import Link from "next/link";
import TableBlock from "@/components/blocks/table";
import { TableColumn } from "@/types/blocks/table";
import { Table as TableSlotType } from "@/types/slots/table";
import { findUserByUuid } from "@/models/user";
import { getTranslations } from "next-intl/server";
import dayjs from "dayjs";
import { redirect } from "next/navigation";
import Image from 'next/image';

export default async function () {
  const t = await getTranslations();

  const userUuid = await getUserUuid();
  const userEmail = await getUserEmail();

  const callbackUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/my-invites`;
  if (!userUuid) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const user = await findUserByUuid(userUuid);
  if (!user) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  let orders = await getOrdersByUserUuid(userUuid);
  if (!orders || orders.length === 0) {
    orders = await getOrdersByPaidEmail(userEmail);
  }

  user.isAffiliate = true;

  if (!orders || orders.length === 0) {
    // not bought
    if (!user.isAffiliate) {
      // no right
      return (
        <div className="text-center flex flex-col items-center justify-center h-full py-16 gap-4">
          <Icon name="RiEmotionSadFill" className="w-8 h-8" />
          <span>{t("my_invites.no_orders")}</span>
        </div>
      );
    }
  } else {
    // bought
    let isAffiliate = false;
    for (const order of orders) {
      if (order.productId === "premium") {
        isAffiliate = true;
        break;
      }
    }

    if (!isAffiliate && !user.isAffiliate) {
      return (
        <div className="text-center flex flex-col items-center justify-center h-full py-16 gap-4">
          <Icon name="RiEmotionSadFill" className="w-8 h-8" />
          <span>{t("my_invites.no_affiliates")}</span>
          <Link
            href="https://discord.gg/HQNnrzjZQS"
            target="_blank"
            className="flex items-center gap-1 font-semibold text-sm text-primary border border-primary rounded-md px-4 py-2"
          >
            <Icon name="RiDiscordFill" className="text-xl" />
            Discord
          </Link>
        </div>
      );
    }
  }

  const affiliates = await getUserAffiliates(userUuid);

  const summary = await getAffiliateSummary(userUuid);

  const columns: TableColumn[] = [
    {
      name: "createdAt",
      title: t("my_invites.table.invite_time"),
      callback: (item) => dayjs(item.createdAt).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      name: "user",
      title: t("my_invites.table.invite_user"),
      callback: (item) => (
        <div className="flex items-center gap-2">
          {item?.user?.avatarUrl && (
            <Image
              src={item.user.avatarUrl}
              alt={item.user.nickname || 'User avatar'}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
          <span>{item.user?.nickname}</span>
        </div>
      ),
    },
    {
      name: "status",
      title: t("my_invites.table.status"),
      callback: (item) =>
        item.status === "pending"
          ? t("my_invites.table.pending")
          : t("my_invites.table.completed"),
    },
    {
      name: "rewardAmount",
      title: t("my_invites.table.reward_amount"),
      callback: (item) => `$${item.rewardAmount / 100}`,
    },
  ];

  const table: TableSlotType = {
    title: t("my_invites.title"),
    description: t("my_invites.description"),
    tip: {
      description: t("my_invites.my_invite_link"),
    },
    toolbar: {
      items: [
        {
          title: t("my_invites.edit_invite_link"),
          icon: "RiBookLine",
          url: "https://docs.shipany.ai",
          target: "_blank",
          variant: "outline",
        },
        {
          title: t("my_invites.copy_invite_link"),
          icon: "RiCopy2Line",
          url: "https://discord.gg/HQNnrzjZQS",
          target: "_blank",
        },
      ],
    },
    columns: columns,
    data: affiliates,
    emptyMessage: t("my_invites.no_invites"),
  };

  return (
    <div className="space-y-8">
      <Invite summary={summary} />
      <TableBlock {...table} />
    </div>
  );
}
