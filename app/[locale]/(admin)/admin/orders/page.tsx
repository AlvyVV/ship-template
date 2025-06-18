import { TableColumn } from "@/types/blocks/table";
import TableSlot from "@/components/dashboard/slots/table";
import { Table as TableSlotType } from "@/types/slots/table";
import { getPaiedOrders } from "@/models/order";
import dayjs from "dayjs";

export default async function () {
  const orders = await getPaiedOrders(1, 50);

  const columns: TableColumn[] = [
    { name: "orderNo", title: "Order No" },
    { name: "paidEmail", title: "Paid Email" },
    { name: "productName", title: "Product Name" },
    { name: "amount", title: "Amount" },
    {
      name: "createdAt",
      title: "Created At",
      callback: (row) => dayjs(row.createdAt).format("YYYY-MM-DD HH:mm:ss"),
    },
  ];

  const table: TableSlotType = {
    title: "Paid Orders",
    columns,
    data: orders,
  };

  return <TableSlot {...table} />;
}
