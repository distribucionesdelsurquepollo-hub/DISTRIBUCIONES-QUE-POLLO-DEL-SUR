"use client";

import SidebarLayout from "../../components/SidebarLayout";
import { useAuth } from "@/src/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center bg-slate-50 font-black text-slate-300 uppercase tracking-[0.5em] animate-pulse">Cargando...</div>;
  }

  if (!user) return null;

  return (
    <SidebarLayout>
      {children}
    </SidebarLayout>
  );
}
