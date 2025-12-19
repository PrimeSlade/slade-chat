"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function NavBar() {
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    return pathname === path
      ? "text-primary"
      : "text-muted-foreground hover:text-primary";
  };

  return (
    <header>
      <nav className="text-xl font-bold flex gap-10">
        <Link href={"/friends"} className={getLinkClass("/friends")}>
          Friends
        </Link>
        <Link href={"/strangers"} className={getLinkClass("/strangers")}>
          Strangers
        </Link>
      </nav>
    </header>
  );
}
