import Empty from "@/components/blocks/empty";
import TableSlot from "@/components/console/slots/table";
import { Table as TableSlotType } from "@/types/slots/table";
import { getCreditsByUserUuid } from "@/models/credit";
import { getTranslations } from "next-intl/server";
import { getUserCredits } from "@/services/credit";
import { getUserUuid } from "@/services/user";
import dayjs from "dayjs";

export default async function () {
  const t = await getTranslations();

  const userUuid = await getUserUuid();

  if (!userUuid) {
    return <Empty message="no auth" />;
  }

  const data = await getCreditsByUserUuid(userUuid, 1, 100);

  const userCredits = await getUserCredits(userUuid);

  const table: TableSlotType = {
    title: t("my_credits.title"),
    tip: {
      title: t("my_credits.left_tip", {
        leftCredits: userCredits?.leftCredits || 0,
      }),
    },
    toolbar: {
      items: [
        {
          title: t("my_credits.recharge"),
          url: "/pricing",
          target: "_blank",
          icon: "RiBankCardLine",
        },
      ],
    },
    columns: [
      {
        title: t("my_credits.table.trans_no"),
        name: "transNo",
      },
      {
        title: t("my_credits.table.trans_type"),
        name: "transType",
      },
      {
        title: t("my_credits.table.credits"),
        name: "credits",
      },
      {
        title: t("my_credits.table.updated_at"),
        name: "createdAt",
        callback: (v: any) => {
          return dayjs(v.createdAt).format("YYYY-MM-DD HH:mm:ss");
        },
      },
    ],
    data,
    emptyMessage: t("my_credits.no_credits"),
  };

  return <TableSlot {...table} />;
}
