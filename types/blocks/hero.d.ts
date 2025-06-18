import { Button, Image, Announcement } from "@/types/blocks/base";

export interface Announcement {
  title?: string;
  description?: string;
  label?: string;
  url?: string;
  target?: string;
}

export interface Hero {
  name?: string;
  disabled?: boolean;
  announcement?: Announcement;
  title?: string;
  highlightText?: string;
  description?: string;
  buttons?: Button[];
  image?: Image;
  tip?: string;
  showHappyUsers?: boolean;
  showBadge?: boolean;
}
