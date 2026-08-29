"use client";
import { useSession } from "@/lib/auth-client";
import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthGuard({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: session, isPending, error } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isPending) return;

    if (!session && !error) {
      router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [session, isPending, error, router, pathname]);

  if (isPending) return null;

  if (!session || error) return null;

  return <div>{children}</div>;
}
