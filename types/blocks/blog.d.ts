import { Image } from "@/types/blocks/base";

export interface BlogItem {
  slug?: string;
  title?: string;
  description?: string;
  authorName?: string;
  authorAvatarUrl?: string;
  createdAt?: string;
  locale?: string;
  coverUrl?: string;
  content?: string;
  url?: string;
  target?: string;
}

export interface Blog {
  disabled?: boolean;
  name?: string;
  title?: string;
  description?: string;
  label?: string;
  icon?: string;
  image?: Image;
  buttons?: Button[];
  items?: BlogItem[];
  readMoreText?: string;
}
