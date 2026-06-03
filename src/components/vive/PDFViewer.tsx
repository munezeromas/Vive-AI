import { useState, useEffect, useRef, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Brain } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface PDFViewerProps {
  file: string;
  page: number;
  fontSize: number;
  onTotalPages?: (n: number) => void;
  onPageChange?: (n: number) => void;
}

export default function PDFViewer({ file, page, fontSize, onTotalPages, onPageChange }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const programmaticScroll = useRef(false);
  const scale = fontSize / 14;

  // Observe each rendered page div and report which is most visible
  const setupObserver = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect();

    const visibilityMap = new Map<number, number>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const pg = Number((e.target as HTMLElement).dataset.page);
          visibilityMap.set(pg, e.intersectionRatio);
        });

        if (!programmaticScroll.current) {
          let maxPg = page;
          let maxRatio = 0;
          visibilityMap.forEach((ratio, pg) => {
            if (ratio > maxRatio) { maxRatio = ratio; maxPg = pg; }
          });
          if (maxRatio > 0.1) onPageChange?.(maxPg);
        }
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0] }
    );

    pageRefs.current.forEach((el) => observerRef.current!.observe(el));
  }, [onPageChange, page]);

  useEffect(() => {
    if (loaded) setupObserver();
    return () => observerRef.current?.disconnect();
  }, [loaded, setupObserver]);

  // Scroll to page when header arrows / input is used
  useEffect(() => {
    const el = pageRefs.current.get(page);
    if (el) {
      programmaticScroll.current = true;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => { programmaticScroll.current = false; }, 800);
    }
  }, [page]);

  return (
    <div className="w-full flex flex-col items-center gap-6 py-4">
      <Document
        file={file}
        onLoadSuccess={({ numPages: n }) => {
          setNumPages(n);
          setLoaded(true);
          onTotalPages?.(n);
        }}
        loading={
          <div className="flex flex-col items-center py-20">
            <Brain className="h-10 w-10 text-[#4A90D9] animate-pulse mb-4" />
            <p className="text-[#4A6A8A] font-black text-base uppercase tracking-widest">Opening book…</p>
          </div>
        }
        error={
          <div className="flex flex-col items-center p-8 text-center">
            <p className="text-red-500 font-bold">Could not load this book.</p>
            <p className="text-xs text-gray-400 mt-1 break-all">{file}</p>
          </div>
        }
      >
        {numPages && Array.from({ length: numPages }, (_, i) => i + 1).map((pg) => (
          <div
            key={pg}
            data-page={pg}
            ref={(el) => {
              if (el) pageRefs.current.set(pg, el);
              else pageRefs.current.delete(pg);
            }}
            className="flex flex-col items-center mb-6"
          >
            {/* Page number pill */}
            <div className="mb-2 px-3 py-1 rounded-full bg-black/10 text-[10px] font-black uppercase tracking-widest text-[#9AA5B4]">
              Page {pg}
            </div>
            <Page
              pageNumber={pg}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              scale={scale}
              className="shadow-[0_8px_40px_rgba(0,0,0,0.12)] rounded-lg overflow-hidden border border-black/5"
              loading={
                <div className="h-[800px] w-[600px] bg-gray-50 flex items-center justify-center rounded-lg border border-black/5">
                  <Brain className="h-6 w-6 text-[#4A90D9] animate-pulse" />
                </div>
              }
            />
          </div>
        ))}
      </Document>
    </div>
  );
}
