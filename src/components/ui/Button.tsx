import { type LucideIcon } from "lucide-react";

interface ButtonProps {
  variant_classes?: string;
  text: string;
  icon?: LucideIcon;
  onClick?: () => void;
  disabled?: boolean;
}

export default function Button({
  variant_classes,
  text,
  icon: Icon,
  onClick,
  disabled,
}: ButtonProps) {
  const similar = "btn rounded-xl btn-xs sm:btn-sm md:btn-md";

  return (
    <button className={similar + " " + variant_classes} onClick={onClick} disabled={disabled}>
      {Icon && <Icon />}
      {text}
    </button>
  );
}
