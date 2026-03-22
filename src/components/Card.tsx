import { type LucideIcon } from "lucide-react";

interface CardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  extraClasses: string;
  variable?: any;
}

export default function Card({
  title,
  description,
  extraClasses,
  icon: Icon,
}: CardProps) {
  return (
    <>
      {/* // Estilo para la card de los objetivos */}
      <div className={`card bg-base-100 card-lg shadow-sm ${extraClasses}`}>
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
    </>
  );
}
