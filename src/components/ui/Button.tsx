import { type LucideIcon } from "lucide-react";
import Spinner from "./Spinner";

interface ButtonProps {
  variant_classes?: string;
  text: string;
  icon?: LucideIcon;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function Button({
  variant_classes,
  text,
  icon: Icon,
  onClick,
  disabled,
  loading = false,
}: ButtonProps) {
  const similar = "btn rounded-xl btn-xs sm:btn-sm md:btn-md";

  return (
    <button
      className={similar + " " + variant_classes}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? <Spinner size="sm" /> : Icon && <Icon />}
      {text}
    </button>
  );
}
