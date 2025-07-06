import { TableColumn } from "@/types/blocks/table";
import TableSlot from "@/components/dashboard/slots/table";
import { Table as TableSlotType } from "@/types/slots/table";
import { getUsers } from "@/models/user";
import dayjs from "dayjs";
import Image from 'next/image';

export default async function () {
  const users = await getUsers(1, 50);

  const columns: TableColumn[] = [
    { name: "uuid", title: "UUID" },
    { name: "email", title: "Email" },
    { name: "nickname", title: "Name" },
    {
      name: "avatarUrl",
      title: "Avatar",
      callback: (row) => (
        <Image 
          src={row.avatarUrl} 
          alt={row.nickname || 'User avatar'}
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover" 
        />
      ),
    },
    {
      name: "createdAt",
      title: "Created At",
      callback: (row) => dayjs(row.createdAt).format("YYYY-MM-DD HH:mm:ss"),
    },
  ];

  const table: TableSlotType = {
    title: "All Users",
    columns,
    data: users,
  };

  return <TableSlot {...table} />;
}
