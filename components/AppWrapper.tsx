'use client';

import { useCom } from "@/features/com/hooks";
import { auth } from "@/lib/firebase";
import { initLocalDB } from "@/localDB";
import { onAuthStateChanged } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

export function AppWrapper({ children }: { children: ReactNode }) {
  const { loadUserInfo, setIsInitLoading } = useCom();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
      await initLocalDB();
      console.log("DB ready");
      if (!mounted) return;
  
      onAuthStateChanged(auth, async (user) => {
        setIsInitLoading(true);
        await loadUserInfo(user, () => {
          if (pathname && pathname !== "/signup") {
            router.push("/signin");
          }
        });
        setIsInitLoading(false);
      });
    };
  
    init();
  
    return () => {
      mounted = false;
    };
  }, []);
  
  return (
    <div>
      {children}
    </div>
  );
}