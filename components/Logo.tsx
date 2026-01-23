import Image from "next/image";

export const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <Image
      src="/logo.png"
      alt="Paw Rescue Logo"
      width={150}
      height={150}
      className={className}
    />
  );
};

export default Logo;
