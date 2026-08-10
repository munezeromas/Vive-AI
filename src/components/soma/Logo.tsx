import viveLogo from "@/assets/vive-logo.png";

interface LogoProps {
  size?: number;
  lightBg?: boolean;
}

export function Logo({ size = 42 }: LogoProps) {
  return (
    <img
      src={viveLogo}
      alt="Vive AI"
      height={size}
      style={{ height: size, width: "auto", objectFit: "contain" }}
    />
  );
}
