import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DnaProfileLayoutProps {
  children: React.ReactNode;
}

const TAB_ROUTES = [
  { value: "favorites", label: "Favorites" },
  { value: "playlist", label: "Playlist" },
  { value: "search", label: "Search" },
  { value: "analytics", label: "Analytics" },
  { value: "time-capsule", label: "Time Capsule" },
];

export default function DnaProfileLayout({ children }: DnaProfileLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Extract current tab from pathname: /dna-profile/<tab>
  const activeTab = React.useMemo(() => {
    const parts = pathname?.split("/") || [];
    return parts[2] ?? "favorites"; // 0:"", 1:"dna-profile", 2:"<tab>"
  }, [pathname]);

  const handleTabChange = (value: string) => {
    router.push(`/dna-profile/${value}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold tracking-tight">DNA Profile</h1>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {TAB_ROUTES.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="capitalize">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <section className="w-full">{children}</section>
    </div>
  );
}