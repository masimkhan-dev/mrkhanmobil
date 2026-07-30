import { useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export function TopLoadingBar() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsub = router.subscribe("onBeforeLoad", () => setIsLoading(true));
    const unsub2 = router.subscribe("onLoad", () => setIsLoading(false));
    return () => {
      unsub();
      unsub2();
    };
  }, [router]);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-primary overflow-hidden pointer-events-none">
      <div
        className="h-full bg-accent animate-[loading_1s_ease-in-out_infinite]"
        style={{ width: "60%" }}
      />
    </div>
  );
}
