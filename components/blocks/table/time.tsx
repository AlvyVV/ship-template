import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// 启用相对时间插件
dayjs.extend(relativeTime);

export default function TableItemTime({
  value,
  options,
  className,
}: {
  value: number;
  options?: any;
  className?: string;
}) {
  return (
    <div className={className}>
      {options?.format
        ? dayjs(value).format(options?.format)
        : dayjs(value).fromNow()}
    </div>
  );
}