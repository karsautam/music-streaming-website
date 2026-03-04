'use client'

import { useContext } from "react";
import { PlayerContext } from "../../layouts/FrontendLayuot";

export default function ClickToClose({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = useContext(PlayerContext);
  if (!context) return <>{children}</>;

  const { setIsQueueModeOpen } = context;

  return (
    <div onClick={() => setIsQueueModeOpen(false)}>
      {children}
    </div>
  );
}