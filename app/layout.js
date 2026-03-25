import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import { Fraunces, Manrope } from "next/font/google";

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
  title: "Aurora Maharlikan Eagles Club | Eastern Luzon Region 5",
  description:
    "Official website of the Aurora Maharlikan Eagles Club, Eastern Luzon Region 5. Service through strong brotherhood.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable}`}>
      <body>
        <header className="site-nav">
          <div className="site-nav__inner">
            <div className="site-nav__brand">
              <Image
                src="/eagle-logo.png"
                alt="Philippine Eagles logo"
                width={56}
                height={56}
                className="site-nav__logo"
                priority
              />
              <div>
                <span className="site-nav__title">Aurora Maharlikan Eagles Club</span>
                <span className="site-nav__subtitle">Eastern Luzon Region 5</span>
              </div>
            </div>
            <nav className="site-nav__links">
              <Link href="/#about">About Us</Link>
              <Link href="/#events">Events</Link>
              <Link href="/directory">Business Directory</Link>
              <Link href="/nest">Eagles' Nest Online</Link>
              <Link href="/#contact">Contact</Link>
            </nav>
            <Link className="btn primary site-nav__cta" href="/#membership">
              Become an Eagle
            </Link>
          </div>
        </header>
        {children}
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
                <div className="site-footer__title">Aurora Maharlikan Eagles Club</div>
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
