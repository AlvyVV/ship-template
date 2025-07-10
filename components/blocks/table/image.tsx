export default function TableItemImage({ value, options, className }: { value: string | string[]; options?: any; className?: string }) {
  const urls = Array.isArray(value) ? value : [value];

  // Button label can be customized via options.label (default "View")
  const label: string = options?.label || 'View';

  return (
    <div className={`flex gap-2 ${className}`}>
      {urls.map((url, idx) => (
        <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="inline-block">
          <button type="button" className="px-2 py-1 text-xs font-medium text-primary underline rounded hover:text-primary/80">
            {urls.length > 1 ? `${label} ${idx + 1}` : label}
          </button>
        </a>
      ))}
    </div>
  );
}