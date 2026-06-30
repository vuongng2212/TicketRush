import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { ApolloWrapper } from "./context/ApolloWrapper";

// Note: Using system fonts as fallback due to network restrictions
// The design system (design-tokens.ts) already specifies Space Grotesk, Inter, and Inter Mono
// which should be loaded via CDN in production or installed locally

export const metadata: Metadata = {
  title: "TicketRush - Concert Ticketing High-Throughput Platform",
  description: "Real-time ticket booking experience built with Spring Boot, WebSockets & Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      style={{
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <body className="min-h-full flex flex-col bg-dark-bg text-zinc-100">
        <AuthProvider>
          <ApolloWrapper>
            {children}
          </ApolloWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
