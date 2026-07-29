export default function SiteStructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.diamondtrivia.app/#organization",
        name: "Diamond Trivia",
        url: "https://www.diamondtrivia.app/",
        logo: "https://www.diamondtrivia.app/diamond-app-icon-v2.webp",
      },
      {
        "@type": "WebSite",
        "@id": "https://www.diamondtrivia.app/#website",
        name: "Diamond Trivia",
        url: "https://www.diamondtrivia.app/",
        publisher: { "@id": "https://www.diamondtrivia.app/#organization" },
        inLanguage: "en-US",
      },
      {
        "@type": "MobileApplication",
        "@id": "https://www.diamondtrivia.app/#app",
        name: "Diamond Trivia",
        applicationCategory: "GameApplication",
        operatingSystem: "iOS, Android",
        downloadUrl: [
          "https://apps.apple.com/us/app/diamond-trivia/id6761062612",
          "https://play.google.com/store/apps/details?id=com.cliqinvite.diamondtriviaapp",
        ],
        publisher: { "@id": "https://www.diamondtrivia.app/#organization" },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
