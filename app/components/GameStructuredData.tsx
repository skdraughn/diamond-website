type Faq = { question: string; answer: string };

export default function GameStructuredData({
  name,
  description,
  path,
  faqs,
}: {
  name: string;
  description: string;
  path: string;
  faqs: Faq[];
}) {
  const url = `https://www.diamondtrivia.app${path}`;
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "VideoGame",
        name,
        description,
        url,
        gamePlatform: "Web Browser",
        applicationCategory: "Game",
        publisher: { "@id": "https://www.diamondtrivia.app/#organization" },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
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
