import { type LucideIcon } from "lucide-react";

interface ButtonProps {
  variant_classes?: string;
  text: string;
  icon?: LucideIcon;
  onClick?: () => void;
}

export default function Button({
  variant_classes,
  text,
  icon: Icon,
  onClick,
}: ButtonProps) {
  const similar = "btn rounded-xl btn-xs sm:btn-sm md:btn-md";

  return (
    <button className={similar + " " + variant_classes} onClick={onClick}>
      {Icon && <Icon />}
      {text}
    </button>
  );
}
