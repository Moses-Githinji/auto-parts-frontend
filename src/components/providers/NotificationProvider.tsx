import type { ReactNode } from "react";
import { ToastContainer } from "../ui/Toast";

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}
