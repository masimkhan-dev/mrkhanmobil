import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/cookie-policy")({
  beforeLoad: () => {
    throw redirect({ to: "/cookies" });
  },
});
