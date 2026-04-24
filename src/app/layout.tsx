import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NFA Alerts - Emergency Response Platform",
  description: "Real-time incident management and coordination platform",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NFA Alerts",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#3b82f6",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js');
                  navigator.serviceWorker.register('/firebase-messaging-sw.js');
                });
              }
              document.addEventListener('gesturestart', function(e) { e.preventDefault(); });
              document.addEventListener('gesturechange', function(e) { e.preventDefault(); });
              document.addEventListener('gestureend', function(e) { e.preventDefault(); });
              document.addEventListener('touchmove', function(e) {
                if (e.touches.length > 1) { e.preventDefault(); }
              }, { passive: false });
            `,
          }}
        />
      </head>
      <body
        className={outfit.className}
        style={{ touchAction: "manipulation" }}
      >
        <div className="hidden md:flex md:items-center md:justify-center md:min-h-screen md:bg-background md:fixed md:inset-0 md:z-9999">
          <div className="text-center px-6 max-w-md">
            <div className="mb-8 text-7xl">📱</div>
            <h1 className="text-3xl font-bold text-foreground mb-3">
              Mobile Only
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              NFA Alerts is designed exclusively for mobile devices. Please
              access this application from your phone or tablet.
            </p>
          </div>
        </div>
        <div className="md:hidden">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
