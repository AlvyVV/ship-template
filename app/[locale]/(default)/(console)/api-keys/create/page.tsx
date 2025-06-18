import { ApikeyStatus, insertApikey } from "@/models/apikey";

import { Apikey } from "@/types/apikey";
import Empty from "@/components/blocks/empty";
import FormSlot from "@/components/console/slots/form";
import { Form as FormSlotType } from "@/types/slots/form";
import { getIsoTimestr } from "@/lib/time";
import { getNonceStr } from "@/lib/hash";
import { getTranslations } from "next-intl/server";
import { getUserUuid } from "@/services/user";

export default async function () {
  const t = await getTranslations();

  const userUuid = await getUserUuid();
  if (!userUuid) {
    return <Empty message="no auth" />;
  }

  const form: FormSlotType = {
    title: t("api_keys.create_api_key"),
    crumb: {
      items: [
        {
          title: t("api_keys.title"),
          url: "/api-keys",
        },
        {
          title: t("api_keys.create_api_key"),
          isActive: true,
        },
      ],
    },
    fields: [
      {
        title: t("api_keys.form.name"),
        name: "title",
        type: "text",
        placeholder: t("api_keys.form.name_placeholder"),
        validation: {
          required: true,
        },
      },
    ],
    passby: {
      userUuid,
    },
    submit: {
      button: {
        title: t("api_keys.form.submit"),
        icon: "RiCheckLine",
      },
      handler: async (data: FormData, passby: any) => {
        "use server";

        const { userUuid } = passby;
        if (!userUuid) {
          throw new Error("no auth");
        }

        const title = data.get("title") as string;
        if (!title || !title.trim()) {
          throw new Error("invalid params");
        }

        const key = `sk-${getNonceStr(32)}`;

        const apikey: Apikey = {
          userUuid,
          apiKey: key,
          title,
          createdAt: getIsoTimestr(),
          status: ApikeyStatus.Created,
        };

        try {
          await insertApikey(apikey);

          return {
            status: "success",
            message: "apikey created",
            redirectUrl: "/api-keys",
          };
        } catch (e: any) {
          console.error(e);
          throw new Error("create api key failed: " + e.message);
        }
      },
    },
  };

  return <FormSlot {...form} />;
}
