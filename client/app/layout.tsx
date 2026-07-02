import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { ApolloWrapper } from "./context/ApolloWrapper";

export const metadata: Metadata = {
  title: "TicketRush — Âm nhạc Việt Nam",
  description: "Đặt vé concert trực tiếp. Không phải qua app generic nào khác.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-ink text-paper font-body">
        <AuthProvider>
          <ApolloWrapper>
            {children}
          </ApolloWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
