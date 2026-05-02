import { type LucideIcon } from "lucide-react";

interface InputProps {
  classes?: string;
  typeInput: string;
  placeholder?: string;
  icon?: LucideIcon;
  disabled?: boolean;
  // Props para input controlado (opcional — si no se pasan, el input funciona sin estado)
  value?: string;
  onChange?: (value: string) => void;
}

export default function Input({
  icon: Icon,
  typeInput,
  placeholder,
  classes,
  disabled,
  value,
  onChange,
}: InputProps) {
  return (
    <>
      {Icon && <Icon />}
      <input
        type={typeInput}
        className={`input grow ${classes} ${disabled ? "input-disabled opacity-60 cursor-not-allowed" : ""}`}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      />
    </>
  );
}
