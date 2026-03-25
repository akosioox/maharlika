import "./globals.css";
import Image from "next/image";
import { Fraunces, Manrope } from "next/font/google";
import ClientNav from "./components/ClientNav";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-fraunces",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-manrope",
});

export const metadata = {
  title: "Aurora Maharlikans | Eastern Luzon Region 5",
  description:
    "Official website of the Aurora Maharlikans, Eastern Luzon Region 5. Service through strong brotherhood.",
  icons: {
    icon: "/eagle-logo.png",
    shortcut: "/eagle-logo.png",
    apple: "/eagle-logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable}`}>
      <body>
        <ClientNav />
        <main className="site-main">{children}</main>
        <footer className="site-footer" id="contact">
          <div className="site-footer__inner">
            <div className="site-footer__brand">
              <Image
                src="/eagle-logo.png"
                alt="Philippine Eagles logo"
                width={40}
                height={40}
                className="site-footer__logo"
              />
              <div>
                <div className="site-footer__title">Aurora Maharlikans</div>
                <div className="site-footer__subtitle">
                  Eastern Luzon Region 5 - Mabuhay Ang May Pusong AGILA!
                </div>
              </div>
            </div>
            <div className="site-footer__contact">
              <div>auroraeaglesclub@gmail.com</div>
              <div>+63 919 000 0000</div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
