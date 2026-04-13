import type { Metadata } from "next";
import "./globals.css";
import { ExpenseProvider } from "@/context/ExpenseContext";

export const metadata: Metadata = {
  title: "SpendWise — Expense Tracker",
  description: "Track your personal expenses with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ExpenseProvider>{children}</ExpenseProvider>
      </body>
    </html>
  );
}
