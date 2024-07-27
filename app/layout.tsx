import { GeistSans } from "geist/font/sans";
import ThemeProvider from "@/providers/ThemeProvider";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TailwindIndicator } from "@/components/TailwindIndicator";
import { Toaster } from "@/components/ui/toaster";
import { ReactQueryClientProvider } from "@/providers/ReactQueryClientProvider";
import Header from "@/components/Header";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Roommate finder",
  icons: {
    icon: "favicon.ico",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: 1,
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-col flex-1">
        {children}
      </main>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={GeistSans.className}
      style={{ colorScheme: "light" }}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground">
        <NextTopLoader showSpinner={false} height={4} color="#2acf80" />
        <ReactQueryClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
            enableColorScheme
          >
            <Layout>
              <Header />
              <div className="p-1">{children}</div>
            </Layout>
            <ReactQueryDevtools initialIsOpen={false} />
            <TailwindIndicator />
            <Toaster />
          </ThemeProvider>
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}
