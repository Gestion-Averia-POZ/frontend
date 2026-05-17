import { ChevronLeft, ChevronRight } from "lucide-react";

const INACTIVE_BG = "#F5F2FF";
const INACTIVE_COLOR = "#64748B";
const ACTIVE_BG = "#0040DF";
const ACTIVE_COLOR = "#FFFFFF";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center gap-2">
      {/* Flecha anterior */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          backgroundColor: INACTIVE_BG,
          color: INACTIVE_COLOR,
          opacity: currentPage === 1 ? 0.4 : 1,
        }}
        className="w-10 h-10 rounded-xl flex items-center justify-center transition-opacity cursor-pointer disabled:cursor-not-allowed"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Números de página */}
      {pages.map((page) => {
        const isActive = page === currentPage;
        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            style={{
              backgroundColor: isActive ? ACTIVE_BG : INACTIVE_BG,
              color: isActive ? ACTIVE_COLOR : INACTIVE_COLOR,
            }}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold transition-colors cursor-pointer"
          >
            {page}
          </button>
        );
      })}

      {/* Flecha siguiente */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          backgroundColor: INACTIVE_BG,
          color: INACTIVE_COLOR,
          opacity: currentPage === totalPages ? 0.4 : 1,
        }}
        className="w-10 h-10 rounded-xl flex items-center justify-center transition-opacity cursor-pointer disabled:cursor-not-allowed"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
