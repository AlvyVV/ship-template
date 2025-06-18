import {
  PostStatus,
  findPostBySlug,
  findPostByUuid,
  insertPost,
  updatePost,
} from "@/models/post";
import { localeNames, locales } from "@/i18n/locale";

import Empty from "@/components/blocks/empty";
import FormSlot from "@/components/dashboard/slots/form";
import { Form as FormSlotType } from "@/types/slots/form";
import { Post } from "@/types/post";
import { getIsoTimestr } from "@/lib/time";
import { getUserInfo } from "@/services/user";

export default async function ({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  const user = await getUserInfo();
  if (!user || !user.uuid) {
    return <Empty message="no auth" />;
  }

  const post = await findPostByUuid(uuid);
  if (!post) {
    return <Empty message="post not found" />;
  }

  const form: FormSlotType = {
    title: "Edit Post",
    crumb: {
      items: [
        {
          title: "Posts",
          url: "/admin/posts",
        },
        {
          title: "Edit Post",
          isActive: true,
        },
      ],
    },
    fields: [
      {
        name: "title",
        title: "Title",
        type: "text",
        placeholder: "Post Title",
        validation: {
          required: true,
        },
      },
      {
        name: "slug",
        title: "Slug",
        type: "text",
        placeholder: "what-is-shipany",
        validation: {
          required: true,
        },
        tip: "post slug should be unique, visit like: /blog/what-is-shipany",
      },
      {
        name: "locale",
        title: "Locale",
        type: "select",
        options: locales.map((locale: string) => ({
          title: localeNames[locale],
          value: locale,
        })),
        value: "en",
        validation: {
          required: true,
        },
      },
      {
        name: "status",
        title: "Status",
        type: "select",
        options: Object.values(PostStatus).map((status: string) => ({
          title: status,
          value: status,
        })),
        value: PostStatus.Created,
      },
      {
        name: "description",
        title: "Description",
        type: "textarea",
        placeholder: "Post Description",
      },
      {
        name: "coverUrl",
        title: "Cover URL",
        type: "url",
        placeholder: "Post Cover Image URL",
      },
      {
        name: "authorName",
        title: "Author Name",
        type: "text",
        placeholder: "Author Name",
      },
      {
        name: "authorAvatarUrl",
        title: "Author Avatar URL",
        type: "url",
        placeholder: "Author Avatar Image URL",
      },
      {
        name: "content",
        title: "Content",
        type: "editor",
        placeholder: "Post Content",
      },
    ],
    data: post,
    passby: {
      user,
      post,
    },
    submit: {
      button: {
        title: "Submit",
      },
      handler: async (data: FormData, passby: any) => {
        "use server";

        const { user, post } = passby;
        if (!user || !post || !post.uuid) {
          throw new Error("invalid params");
        }

        const title = data.get("title") as string;
        const slug = data.get("slug") as string;
        const locale = data.get("locale") as string;
        const status = data.get("status") as string;
        const description = data.get("description") as string;
        const coverUrl = data.get("coverUrl") as string;
        const authorName = data.get("authorName") as string;
        const authorAvatarUrl = data.get("authorAvatarUrl") as string;
        const content = data.get("content") as string;

        if (
          !title ||
          !title.trim() ||
          !slug ||
          !slug.trim() ||
          !locale ||
          !locale.trim()
        ) {
          throw new Error("invalid form data");
        }

        const existPost = await findPostBySlug(slug, locale);
        if (existPost && existPost.uuid !== post.uuid) {
          throw new Error("post with same slug already exists");
        }

        const updatedPost: Partial<Post> = {
          updatedAt: getIsoTimestr(),
          status,
          title,
          slug,
          locale,
          description,
          coverUrl,
          authorName,
          authorAvatarUrl,
          content,
        };

        try {
          await updatePost(post.uuid, updatedPost);

          return {
            status: "success",
            message: "Post updated",
            redirectUrl: "/admin/posts",
          };
        } catch (err: any) {
          throw new Error(err.message);
        }
      },
    },
  };

  return <FormSlot {...form} />;
}
