export interface SidebarItem {
  title: string;
  url?: string;
  icon?: string;
  isActive?: boolean;
  children?: SidebarItem[];
}

export interface Sidebar {
  items?: SidebarItem[];
  nav?: {
    items: SidebarItem[];
  };
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
  };
}