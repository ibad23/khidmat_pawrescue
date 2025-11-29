"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  activeClassName?: string;
}

export const NavLink = ({ to, className = "", activeClassName = "", children, ...props }: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === to || pathname?.startsWith(to + "/");

  return (
    <Link href={to} {...props} className={cn(className, isActive && activeClassName)}>
      {children}
    </Link>
  );
};

export default NavLink;
