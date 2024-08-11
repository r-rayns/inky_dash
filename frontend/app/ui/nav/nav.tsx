"use client";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { name: "Display", href: "/" },
  { name: "About", href: "/about/" },
];
export default function Nav() {
  const pathname = usePathname();
  return (
    <div className='flex flex-row mb-4 gap-4 '>
      {links.map((link) => {
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx("hover:bg-gray-700", {
              "underline decoration-orange-500": pathname === link.href,
            })}
          >
            <span className="text-lg md:text-xl text-slate-300">{link.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
