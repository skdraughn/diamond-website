import Link from "next/link";

export default function PrivacyPolicy() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 font-sans text-zinc-600 dark:bg-black dark:text-zinc-400 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl bg-white p-8 shadow-sm dark:bg-zinc-900 dark:border dark:border-zinc-800 sm:p-12 rounded-lg">
        {/* Navigation */}
        <div className="mb-8 border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <Link
            href="/"
            className="group inline-flex items-center text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-red-600 transition-colors"
          >
            <svg
              className="mr-2 h-3 w-3 transition-transform group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Return to Application
          </Link>
        </div>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white sm:text-4xl uppercase tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-zinc-500 font-mono">
            Effective Date: {lastUpdated}
          </p>
        </div>

        {/* Legal Content - 'Wall of Text' Style */}
        <div className="space-y-8 text-sm leading-7 text-justify">
          <section>
            <p>
              Welcome to <strong>Diamond Trivia</strong> ("Company", "we", "our",
              "us"). We are committed to protecting your personal information
              and your right to privacy. If you have any questions or concerns
              about this privacy notice or our practices with regard to your
              personal information, please contact us at swipebite1@gmail.com.
            </p>
            <p className="mt-4">
              When you visit our website and use our mobile application (the
              "App") and more generally, use any of our services (the
              "Services", which include the App), we appreciate that you are
              trusting us with your personal information. We take your privacy
              very seriously. In this privacy notice, we seek to explain to you
              in the clearest way possible what information we collect, how we
              use it, and what rights you have in relation to it. Please read
              this privacy notice carefully, as it will help you understand what
              we do with the information that we collect.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-zinc-900 dark:text-white uppercase">
              1. Information We Collect
            </h2>
            <p>
              We collect information that allows us to provide the Services to
              you. This information includes:
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <strong className="block text-zinc-900 dark:text-zinc-200">
                  1.1 Personal Information Provided by You
                </strong>
                <p className="mt-1">
                  We do not require you to register an account to play Diamond
                  Trivia. Therefore, we do not collect names, phone numbers,
                  email addresses, or physical addresses from users for the
                  purpose of basic gameplay. If you voluntarily contact us for
                  support, we will collect your email address and the content of
                  your message solely to respond to your inquiry.
                </p>
              </div>
              <div>
                <strong className="block text-zinc-900 dark:text-zinc-200">
                  1.2 Information Automatically Collected
                </strong>
                <p className="mt-1">
                  We automatically collect certain information when you visit,
                  use, or navigate the App. This information does not reveal
                  your specific identity (like your name or contact information)
                  but may include device and usage information, such as your IP
                  address, browser and device characteristics, operating system,
                  language preferences, referring URLs, device name, country,
                  location, information about how and when you use our App, and
                  other technical information. This information is primarily
                  needed to maintain the security and operation of our App, and
                  for our internal analytics and reporting purposes.
                </p>
              </div>
              <div>
                <strong className="block text-zinc-900 dark:text-zinc-200">
                  1.3 Log and Usage Data
                </strong>
                <p className="mt-1">
                  Log data is service-related, diagnostic, usage, and
                  performance information our servers automatically collect when
                  you access or use our App and which we record in log files.
                  Depending on how you interact with us, this log data may
                  include your IP address, device information, browser type, and
                  settings and information about your activity in the App (such
                  as the date/time stamps associated with your usage, pages and
                  files viewed, searches, and other actions you take such as
                  which features you use), device event information (such as
                  system activity, error reports, and hardware settings).
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-zinc-900 dark:text-white uppercase">
              2. How We Use Your Information
            </h2>
            <p>
              We use personal information collected via our App for a variety of
              business purposes described below. We process your personal
              information for these purposes in reliance on our legitimate
              business interests, in order to enter into or perform a contract
              with you, with your consent, and/or for compliance with our legal
              obligations. We indicate the specific processing grounds we rely
              on next to each purpose listed below:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 marker:text-zinc-400">
              <li>
                To facilitate account creation and logon process (if applicable
                in future updates).
              </li>
              <li>
                To send administrative information to you regarding updates to
                our terms, conditions, and policies.
              </li>
              <li>
                To protect our Services (e.g., fraud monitoring and prevention).
              </li>
              <li>
                To enforce our terms, conditions, and policies for business
                purposes, to comply with legal and regulatory requirements or in
                connection with our contract.
              </li>
              <li>
                To respond to legal requests and prevent harm. If we receive a
                subpoena or other legal request, we may need to inspect the data
                we hold to determine how to respond.
              </li>
              <li>
                To deliver and facilitate delivery of services to the user.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-zinc-900 dark:text-white uppercase">
              3. Sharing Your Information
            </h2>
            <p>
              We may process or share your data that we hold based on the
              following legal basis:
            </p>
            <ul className="mt-4 space-y-3">
              <li className="flex gap-3">
                <span className="shrink-0 font-bold text-zinc-900 dark:text-zinc-200">
                  Consent:
                </span>
                <span>
                  We may process your data if you have given us specific consent
                  to use your personal information for a specific purpose.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 font-bold text-zinc-900 dark:text-zinc-200">
                  Legitimate Interests:
                </span>
                <span>
                  We may process your data when it is reasonably necessary to
                  achieve our legitimate business interests.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 font-bold text-zinc-900 dark:text-zinc-200">
                  Legal Obligations:
                </span>
                <span>
                  We may disclose your information where we are legally required
                  to do so in order to comply with applicable law, governmental
                  requests, a judicial proceeding, court order, or legal
                  process.
                </span>
              </li>
            </ul>
            <p className="mt-4">
              We may share your data with third-party vendors, service
              providers, contractors, or agents who perform services for us or
              on our behalf and require access to such information to do that
              work. Examples include: data analysis (e.g., Google Analytics),
              hosting services (e.g., AWS Amplify), and customer service. We may
              allow selected third parties to use tracking technology on the
              App, which will enable them to collect data on our behalf about
              how you interact with our App over time.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-zinc-900 dark:text-white uppercase">
              4. Data Retention & Security
            </h2>
            <p>
              We will only keep your personal information for as long as it is
              necessary for the purposes set out in this privacy notice, unless
              a longer retention period is required or permitted by law (such as
              tax, accounting, or other legal requirements). When we have no
              ongoing legitimate business need to process your personal
              information, we will either delete or anonymize such information,
              or, if this is not possible (for example, because your personal
              information has been stored in backup archives), then we will
              securely store your personal information and isolate it from any
              further processing until deletion is possible.
            </p>
            <p className="mt-4">
              We have implemented appropriate technical and organizational
              security measures designed to protect the security of any personal
              information we process. However, despite our safeguards and
              efforts to secure your information, no electronic transmission
              over the Internet or information storage technology can be
              guaranteed to be 100% secure, so we cannot promise or guarantee
              that hackers, cybercriminals, or other unauthorized third parties
              will not be able to defeat our security, and improperly collect,
              access, steal, or modify your information.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-zinc-900 dark:text-white uppercase">
              5. Privacy Rights (GDPR & CCPA)
            </h2>
            <div className="space-y-4">
              <p>
                Depending on your location, you may have the following rights
                regarding your personal data:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  <strong>Right to Access:</strong> You have the right to
                  request copies of your personal data.
                </li>
                <li>
                  <strong>Right to Rectification:</strong> You have the right to
                  request that we correct any information you believe is
                  inaccurate.
                </li>
                <li>
                  <strong>Right to Erasure:</strong> You have the right to
                  request that we erase your personal data, under certain
                  conditions.
                </li>
                <li>
                  <strong>Right to Restrict Processing:</strong> You have the
                  right to request that we restrict the processing of your
                  personal data, under certain conditions.
                </li>
              </ul>
              <p>
                <strong>California Residents:</strong> Under the California
                Consumer Privacy Act (CCPA), you have specific rights regarding
                access to your personal information. Diamond Trivia does not
                sell your personal data. If you are a California resident, you
                can request a notice disclosing the categories of personal
                information we have shared with third parties for their direct
                marketing purposes during the preceding calendar year.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-zinc-900 dark:text-white uppercase">
              6. Policy Updates
            </h2>
            <p>
              We may update this privacy notice from time to time. The updated
              version will be indicated by an updated "Revised" date and the
              updated version will be effective as soon as it is accessible. If
              we make material changes to this privacy notice, we may notify you
              either by prominently posting a notice of such changes or by
              directly sending you a notification. We encourage you to review
              this privacy notice frequently to be informed of how we are
              protecting your information.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-zinc-900 dark:text-white uppercase">
              7. Contact Us
            </h2>
            <p>
              If you have questions or comments about this policy, you may email
              us at{" "}
              <a
                href="mailto:swipebite1@gmail.com"
                className="font-bold text-zinc-900 underline dark:text-white"
              >
                swipebite1@gmail.com
              </a>
              .
            </p>
          </section>
        </div>

        {/* Footer Legal */}
        <div className="mt-16 border-t border-zinc-200 pt-8 text-center dark:border-zinc-800">
          <p className="text-xs text-zinc-400">
            © {new Date().getFullYear()} Diamond Trivia. All rights reserved.
            This document is for informational purposes only and does not
            constitute legal advice.
          </p>
        </div>
      </div>
    </div>
  );
}