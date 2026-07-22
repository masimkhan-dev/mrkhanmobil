import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    const user = data.user || { id: "demo-user-id", email: "demo@mrkhan-repairs.co.uk" };
    return { user };
  },
  component: () => <Outlet />,
});
