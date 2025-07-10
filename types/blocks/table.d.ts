export interface TableColumn {
  key?: string;
  name?: string;
  type?: string;
  title: string;
  dataIndex?: string;
  callback?: (item: any) => any;
  render?: (value: any, record: any, index: number) => React.ReactNode;
}