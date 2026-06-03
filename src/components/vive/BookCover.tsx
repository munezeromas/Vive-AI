
import React from "react";
import { BookOpen } from "lucide-react";

interface BookCoverProps {
  title: string;
  file: string;
  subject: string;
}

export const BookCover: React.FC<BookCoverProps> = ({ title, file, subject }) => {
  return (
    <div className="relative w-full h-full group overflow-hidden rounded-2xl bg-slate-900 border border-white/10 shadow-2xl transform transition-transform group-hover:rotate-1">
      {/* First Page Preview Iframe */}
      <div className="absolute inset-x-0 top-0 bottom-1/4 pointer-events-none">
        <iframe 
          src={`${file}#page=1&toolbar=0&navpanes=0&scrollbar=0`} 
          className="w-[200%] h-[200%] origin-top-left scale-[0.5] grayscale-[0.5] group-hover:grayscale-0 transition-all opacity-40 group-hover:opacity-60"
        />
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-end p-6 text-center space-y-2 z-10">
        <div className="h-10 w-8 rounded bg-primary/20 flex items-center justify-center border border-primary/30 group-hover:scale-110 transition-transform">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-primary/80 mb-0.5">{subject}</p>
          <h4 className="text-[11px] font-black text-white leading-tight uppercase tracking-tight line-clamp-2">{title}</h4>
        </div>
      </div>
      
      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080C14]/40 via-transparent to-[#080C14] pointer-events-none" />
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};
