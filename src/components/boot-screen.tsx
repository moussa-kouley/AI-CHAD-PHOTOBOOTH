export function BootScreen({ label = "Un instant" }: { label?: string }) {
  return (
    <div className="boot-screen" role="status" aria-live="polite">
      <i />
      <p>{label}</p>
    </div>
  );
}
