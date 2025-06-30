import React from 'react';

export default function Loader({ text = 'loading' }: { text?: string }) {
  return (
    <div className="loader relative w-20 h-12">
      <span className="loader-text absolute top-0 text-xs tracking-[1px] animate-text713">{text}</span>
      <span className="load h-4 w-4 rounded-full block absolute bottom-0 animate-loading713" />
      <style jsx>{`
        @keyframes text_713 {
          0% {
            letter-spacing: 1px;
            transform: translateX(0px);
          }
          40% {
            letter-spacing: 2px;
            transform: translateX(26px);
          }
          80% {
            letter-spacing: 1px;
            transform: translateX(32px);
          }
          90% {
            letter-spacing: 2px;
            transform: translateX(0px);
          }
          100% {
            letter-spacing: 1px;
            transform: translateX(0px);
          }
        }
        @keyframes loading_713 {
          0% {
            width: 16px;
            transform: translateX(0px);
          }
          40% {
            width: 100%;
            transform: translateX(0px);
          }
          80% {
            width: 16px;
            transform: translateX(64px);
          }
          90% {
            width: 100%;
            transform: translateX(0px);
          }
          100% {
            width: 16px;
            transform: translateX(0px);
          }
        }
        @keyframes loading2_713 {
          0% {
            transform: translateX(0px);
            width: 16px;
          }
          40% {
            transform: translateX(0%);
            width: 80%;
          }
          80% {
            width: 100%;
            transform: translateX(0px);
          }
          90% {
            width: 80%;
            transform: translateX(15px);
          }
          100% {
            transform: translateX(0px);
            width: 16px;
          }
        }
        .loader-text {
          animation: text_713 3.5s ease both infinite;
          color: var(--primary);
        }
        .load {
          animation: loading_713 3.5s ease both infinite;
          background-color: var(--primary);
        }
        .load::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background-color: var(--accent);
          border-radius: inherit;
          animation: loading2_713 3.5s ease both infinite;
        }
      `}</style>
    </div>
  );
}
