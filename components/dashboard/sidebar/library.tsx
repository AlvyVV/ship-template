"use client";


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Library as LibraryType } from "@/types/blocks/base";
import Icon from "@/components/icon";
import { Link, usePathname } from "@/i18n/routing";

export function Library({ library }: { library: LibraryType }) {
  const { isMobile } = useSidebar();
  const pathname = usePathname();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{library.title}</SidebarGroupLabel>
      <SidebarMenu>
        {library.items?.map((item, index) => (
          <SidebarMenuItem key={index}>
            <SidebarMenuButton
              tooltip={item.title}
              className={`${
                item.isActive || pathname.endsWith(item.url as string)
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                  : ""
              }`}
            >
              <Link
                href={(item.url || "") as any}
                target={item.target}
                className="w-full flex items-center gap-2 cursor-pointer"
              >
                {item.icon && <Icon name={item.icon} />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
            <DropdownMenu>
              {/* <DropdownMenuTrigger asChild>
                <SidebarMenuAction
                  showOnHover
                  className="data-[state=open]:bg-accent rounded-sm"
                >
                  <Icon name="BsThreeDots" />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger> */}
              {/* <DropdownMenuContent
                className="w-24 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem>
                  <Icon name="RiFolder3Line" />
                  <span>Open</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Icon name="RiShareLine" />
                  <span>Share</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <Icon name="RiDeleteBin6Line" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent> */}
            </DropdownMenu>
          </SidebarMenuItem>
        ))}

        {library.more && (
          <SidebarMenuItem>
            <SidebarMenuButton className="text-sidebar-foreground/70">
              <Icon name="BsThreeDots" className="text-sidebar-foreground/70" />
              <span>{library.more.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
