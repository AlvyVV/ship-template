import Empty from "@/components/blocks/empty";
import TableSlot from "@/components/console/slots/table";
import { Table as TableSlotType } from "@/types/slots/table";
import { getTranslations } from "next-intl/server";
import { getUserApikeys, ApikeyStatus } from "@/models/apikey";
import { getUserUuid } from "@/services/user";
import dayjs from "dayjs";
import { Badge } from "@/components/ui/badge";

export default async function () {
  const t = await getTranslations();

  const userUuid = await getUserUuid();
  if (!userUuid) {
    return <Empty message="no auth" />;
  }

  const data = await getUserApikeys(userUuid);

  const table: TableSlotType = {
    title: t("api_keys.title"),
    tip: {
      title: t("api_keys.tip"),
    },
    toolbar: {
      items: [
        {
          title: t("api_keys.create_api_key"),
          url: "/api-keys/create",
          icon: "RiAddLine",
        },
      ],
    },
    columns: [
      {
        title: t("api_keys.table.name"),
        name: "title",
      },
      {
        title: t("api_keys.table.key"),
        name: "apiKey",
        type: "copy",
        callback: (item: any) => {
          return item.apiKey.slice(0, 4) + "..." + item.apiKey.slice(-4);
        },
      },
      {
        title: t("api_keys.table.created_at"),
        name: "createdAt",
        callback: (item: any) => {
          return dayjs(item.createdAt).fromNow();
        },
      },
    ],
    data,
    emptyMessage: t("api_keys.no_api_keys"),
  };

  return <TableSlot {...table} />;
}
