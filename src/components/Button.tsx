interface ButtonProps {
  variant_classes?: string;
  text: string;
}

export default function Button({ variant_classes, text }: ButtonProps) {
  const similar = "btn rounded-xl btn-xs sm:btn-sm md:btn-md";

  return (
    <>
      <button className={similar + " " + variant_classes}>{text}</button>
    </>
  );
}
