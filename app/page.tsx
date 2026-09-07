"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/session-context";

export default function Home() {
  const router = useRouter();
  const { user, isReady } = useSession();

  useEffect(() => {
    if (!isReady) return;
    router.replace(user ? "/dashboard" : "/login");
  }, [isReady, user, router]);

  return null;
}
