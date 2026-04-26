"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export const Logo = ({ className = "" }: { className?: string }) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use a default or placeholder during hydration
  const src = !mounted ? "/logo_dark.svg" : (resolvedTheme === "dark" ? "/logo_light.svg" : "/logo_dark.svg");

  return (
    <Image
      src={src}
      alt="Paw Rescue Logo"
      width={150}
      height={150}
      className={className}
      priority
    />
  );
};

export default Logo;
