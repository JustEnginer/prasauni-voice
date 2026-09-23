import type {Metadata} from "next";
import "./globals.css";
export const metadata:Metadata={title:{default:"प्रसौनी Voice | Prasauni Voice",template:"%s · Prasauni Voice"},description:"प्रसौनी, बाराको आवाज। Local stories, community updates, photos and videos from Prasauni Voice, Nepal.",icons:{icon:"/favicon.svg",shortcut:"/favicon.svg"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ne"><body>{children}</body></html>}
