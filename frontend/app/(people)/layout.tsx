"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    return pathname === path
      ? "text-primary"
      : "text-muted-foreground hover:text-primary";
  };

  return (
    <>
      <div className="p-4 space-y-4">
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
        <div>{children}</div>
      </div>
    </>
  );
}
