import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Reclaim Demo App",
  description: "Bring users' activity, reputation and identity from other websites into yours, using the easy to use Reclaim SDKs.",
};

export default function RootLayout({ children }) {
  console.log(`
  _    _                                _     _      _             _ 
 | |  | |                              | |   (_)    (_)           | |
 | |  | | ___        __ _ _ __ ___    | |__  _ _ __ _ _ __   __ _| |
 | |/\\| |/ _ \\    / _\` | '__/ _ \\  | '_\\| | '__| | '_ \\ / _\` | |
 \\  /\\  /  __/   | (_| | | |  __/    | | | | | |  | | | | | (_| |_|
  \\/  \\/ \\___|   \\__,_|_|  \\___|  |_| |_|_|_|  |_|_| |_|\\__, (_)
                                                                __/ |  
                                                              |___/   
 
 If you are here, we're hiring hackers like you - integration engineering. 
 You will be looking at chrome devtools and building reclaim providers
 
 Apply :
 https://x.com/madhavanmalolan/status/1792949714813419792
   `);
  return (
    <html lang="en" className="bg-black">
      <body className={inter.className}>
        {children}
        <div
          dangerouslySetInnerHTML={{
            __html: `
              <!--
              _    _                                     _   _      _             _
             | |  | |                                   | |   (_)    (_)           | |
             | |  | | ___          __ _ _ __ ___        | |__  _ _ __ _ _ __   __ _| |
              | |/\\| |/ _ \\    / _\` | '__/ _ \\      | '_ \\| | '__| | '_ \\ / _\` | |
             \\  /\\  /  __/      | (_| | | |  __/      | | | | | |  | | | | | (_| |_|
              \\/  \\/ \\___|     \\__,_|_|  \\___|     |_| |_|_|_|  |_|_| |_|\\__, (_)
                                                                               __/ |
                                                                              |___/

              If you are here, we're hiring hackers like you - integration engineering.
              You will be looking at chrome devtools and building reclaim providers.

              Apply:
              https://x.com/madhavanmalolan/status/1792949714813419792
              -->
            `,
          }}
        />
      </body>
    </html>
  );
}
