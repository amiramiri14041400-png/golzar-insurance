import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "گلزار بیمه ایران | صدور و تمدید آنلاین بیمه",
  description:
    "ثبت درخواست، استعلام قیمت و پیگیری آنلاین انواع بیمه ایران. مشاوره رایگان توسط کارشناسان گلزار بیمه.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}