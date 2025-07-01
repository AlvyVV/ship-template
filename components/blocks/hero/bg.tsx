import Threads from '@/components/ui/Threads/Threads';

export default function Bg() {
  return (
    <div className="-z-50 absolute inset-0 w-full h-full flex items-center justify-center opacity-75 [mask-image:linear-gradient(to_right,white,transparent,transparent,white)]">
      <Threads amplitude={1.2} distance={0} enableMouseInteraction={true} />
    </div>
  );
}
