import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pranav Core Engine | Cinematic Engineer Portfolio",
  description: "A high-fidelity, futuristic portfolio system for Pranav Birhade, Web Developer and AI System Builder.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased selection:bg-cyan-500/30" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
