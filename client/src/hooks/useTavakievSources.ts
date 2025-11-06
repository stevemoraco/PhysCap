import { useQuery } from "@tanstack/react-query";
import { tavakievFallbackSections } from "@/lib/tavakievFallback";
import type { TavakievSourceRecord } from "@/lib/tavakievTypes";

async function fetchTavakievSections(): Promise<TavakievSourceRecord[]> {
  const response = await fetch("/api/tavakiev/sections", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to load Tavakiev sections: ${response.statusText}`);
  }

  const data = (await response.json()) as TavakievSourceRecord[];
  return data.length > 0 ? data : tavakievFallbackSections;
}

export function useTavakievSources() {
  return useQuery<TavakievSourceRecord[]>({
    queryKey: ["tavakiev", "sections"],
    queryFn: fetchTavakievSections,
    initialData: tavakievFallbackSections,
    staleTime: 1000 * 60 * 5,
  });
}

