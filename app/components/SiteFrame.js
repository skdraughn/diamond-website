import Footer from "./Footer";
import TriviaSideNav from "./TriviaSideNav";
import styles from "./siteShell.module.css";
export default function SiteFrame({children}) {
 return <><a className={styles.skipLink} href="#site-content">Skip to content</a><div className={styles.shell}><TriviaSideNav/><div id="site-content" tabIndex={-1} className={styles.content}>{children}</div></div><Footer sx={{ mt: 5 }} /></>;
}
