"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {gameLinks} from "./gameNavigation";
import styles from "./siteShell.module.css";
export default function TriviaSideNav({mobile=false,onNavigate}) {
 const pathname=usePathname() || "/";
 const link=(href,label)=><Link key={href} href={href} onClick={onNavigate} aria-current={pathname===href || (href!=="/" && pathname.startsWith(href+"/")) ? "page" : undefined}>{label}</Link>;
 return <aside className={`${styles.rail} ${mobile ? styles.mobileRail : ""}`} aria-label="Diamond navigation">
  <nav aria-label="Games">{link("/","All games")}{gameLinks.map(({href,label})=>link(href,label))}</nav>
  <nav aria-label="Help and information">{link("/support","Support")}{link("/privacy","Privacy")}</nav>
 </aside>;
}
