import { type LucideIcon, ArrowRight } from "lucide-react";

interface CardProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  bgIcon?: LucideIcon;
  bgImage?: string;
  extraClasses: string;
  compact?: boolean;
}

export default function Card({
  title,
  description,
  extraClasses,
  icon: Icon,
  bgIcon: BgIcon,
  bgImage,
  compact = false,
}: CardProps) {
  if (compact) {
    return (
      <div className={`rounded-xl shadow-sm ${extraClasses}`}>
        <div className="flex items-center gap-3 p-4">
          {Icon && (
            <div className="w-fit p-1.5 rounded-md bg-current/10">
              <Icon size={18} className="opacity-80" />
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            <h2 className="text-xs font-semibold uppercase tracking-wide leading-none">
              {title}
            </h2>
            <p className="text-2xl font-bold leading-none">{description}</p>
          </div>
        </div>
      </div>
    );
  }

  if (BgIcon || bgImage) {
    return (
      <div
        className={`card-lg shadow-sm relative overflow-hidden ${extraClasses}`}
      >
        <div className="p-4 relative z-10 flex flex-col gap-1">
          {Icon && (
            <div className="w-fit p-1.5 bg-black/10">
              <Icon size={16} />
            </div>
          )}
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="text-2xl font-bold">{description}</p>
          <div className="flex justify-end mt-1">
            <ArrowRight size={16} />
          </div>
        </div>
        {BgIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
            <BgIcon size={64} />
          </div>
        )}
        {bgImage && (
          <img
            src={bgImage}
            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none h-16 w-auto"
            aria-hidden="true"
          />
        )}
      </div>
    );
  }

  return (
    <div className={`card card-lg shadow-sm ${extraClasses}`}>
      <div className="card-body">
        {Icon && (
          <div className="w-fit p-2 rounded-md bg-[#2563EB]/10">
            <Icon color="#2563EB" />
          </div>
        )}
        <h2 className="card-title">{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}
