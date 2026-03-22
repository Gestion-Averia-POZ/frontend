import { type LucideIcon } from "lucide-react";
import Button from "./Button";
import Input from "./Input";

interface Field {
  icon?: React.ElementType;
  label: string;
  placeholder: string;
  type?: string;
}

interface FormProps {
  textButton: string;
  classes?: string;
  submitClasses?: string;
  noBorder?: boolean;
  gridFields?: number;
  fields: Field[];
  submitIcon?: LucideIcon;
}

export default function Form({
  classes = "",
  fields,
  submitIcon,
  textButton,
  submitClasses = "w-[219px] h-[56px]",
  noBorder = false,
  gridFields,
}: FormProps) {
  const containerClasses = noBorder
    ? classes
    : `border border-[#E2E8F0] rounded-xl p-8 ${classes}`;

  const renderField = ({ icon: Icon, label, placeholder, type = "text" }: Field) => (
    <div key={label}>
      <label className="label mb-1">
        {Icon && <Icon color="#2563EB" size={16} />}
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
          typeInput={type}
          placeholder={placeholder}
          classes="w-full"
        />
      )}
    </div>
  );

  const gridSection = gridFields ? fields.slice(0, gridFields) : [];
  const stackSection = gridFields ? fields.slice(gridFields) : fields;

  return (
    <div className={containerClasses}>
      <div className="flex flex-col gap-4">
        {gridSection.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {gridSection.map(renderField)}
          </div>
        )}
        {stackSection.map(renderField)}
      </div>

      <Button
        text={textButton}
        variant_classes={`btn-primary mt-6 ${submitClasses}`}
        icon={submitIcon}
      />
    </div>
  );
}
