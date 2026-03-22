import Button from "./Button";
import Input from "./Input";
import { type LucideIcon } from "lucide-react";

interface Field {
  icon: React.ElementType;
  label: string;
  placeholder: string;
}

interface FormProps {
  classes?: string;
  fields: Field[];
  submitIcon?: LucideIcon;
}
export default function Form({ classes = "", fields, submitIcon }: FormProps) {
  return (
    <div className={`border border-[#E2E8F0] rounded-xl p-8 ${classes}`}>
      <div className="flex flex-col gap-4">
        {fields.map(({ icon: Icon, label, placeholder }) => (
          <div key={label}>
            <label className="label mb-1">
              <Icon color="#2563EB" size={16} />
              <span className="label-text font-medium">{label}</span>
            </label>
            {label === "Mensaje" ? (
              <textarea
                className="textarea w-full resize-none"
                placeholder={placeholder}
                rows={4}
              />
            ) : (
              <Input
                typeInput="text"
                placeholder={placeholder}
                classes="w-full"
              />
            )}
          </div>
        ))}
      </div>
      <Button
        text="Enviar mensaje"
        variant_classes="btn-primary mt-6 w-[219px] h-[56px]"
        icon={submitIcon}
      />
    </div>
  );
}
