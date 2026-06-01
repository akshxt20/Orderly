import { Toaster } from "@/components/ui/Toaster";
import { AppRoutes } from "@/routes";

export default function App() {
  return (
    <>
      <AppRoutes />
      <Toaster />
    </>
  );
}
