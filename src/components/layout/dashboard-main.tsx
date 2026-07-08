"use client";



import { cn } from "@/lib/utils";

import { useSidebar } from "@/components/layout/sidebar-context";



export function DashboardMain({ children }: { children: React.ReactNode }) {

  const { collapsed } = useSidebar();



  return (

    <main

      className={cn(

        "dash-main min-w-0 transition-[margin] duration-300 ease-in-out",

        "ml-0",

        collapsed ? "lg:ml-[var(--dash-sidebar-w-collapsed)]" : "lg:ml-[var(--dash-sidebar-w)]",

      )}

    >

      {children}

    </main>

  );

}

