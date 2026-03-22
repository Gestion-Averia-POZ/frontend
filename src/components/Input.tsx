import { type LucideIcon } from "lucide-react";

interface InputProps {
  classes?: string;
  typeInput: string;
  placeholder?: string;
  icon?: LucideIcon;
}

export default function Input({ icon: Icon, typeInput, placeholder, classes }: InputProps) {
  return (
    <>
      {Icon && <Icon />}
      <input
        type={typeInput}
        className={`input grow ${classes}`}
        placeholder={placeholder}
      />
    </>
  );
}
