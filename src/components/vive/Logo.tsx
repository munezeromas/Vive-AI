import logo from "@/assets/vive-logo.png";

export function Logo({
  size = 240,
}: {
  size?: number;
  withText?: boolean;
  lightBg?: boolean;
}) {
  // Multiply the requested size so the logo appears much larger everywhere
  const scaledSize = size * 2.5;

  return (
    <div className="inline-flex items-center select-none group">
      <img
        src={logo}
        alt="Vive AI"
        style={{ height: scaledSize, maxHeight: '100%', maxWidth: '100%' }}
        className="object-contain transition-transform group-hover:scale-105"
      />
    </div>
  );
}