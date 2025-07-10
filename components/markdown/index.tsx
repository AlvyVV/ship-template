import "./markdown.css";

export default function Markdown({ content }: { content: string }) {
  return (
    <div 
      className="markdown bg-background prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
