export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-[calc(100vh_-_theme(spacing.20))]">
      {children}
    </div>
  );
}
