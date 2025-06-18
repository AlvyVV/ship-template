import { Button, Brand, Nav } from "@/types/blocks/base";

export interface Header {
  disabled?: boolean;
  name?: string;
  brand?: Brand;
  nav?: Nav;
  buttons?: Button[];
  className?: string;
  showSign?: boolean;
  showLocale?: boolean;
  showTheme?: boolean;
}
