import { StudioNav } from "@/components/studio-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="studio-app">
      <StudioNav />
      <div className="studio-body">{children}</div>
    </div>
  );
}
