import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function PrivacyPolicy() {
  const [, setLocation] = useLocation();

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen p-6">
      <button
        onClick={() => setLocation(-1)}
        className="flex items-center text-blush hover:text-blush/80 mb-6"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back
      </button>

      <Card>
        <CardContent className="p-8 prose prose-sm max-w-none">
          <h1 className="text-3xl font-bold text-deep-teal mb-4">The Heart Next Door App – Privacy Policy</h1>
          
          <p className="text-sm text-gray-500 mb-6">Last updated: January 2026</p>

          <p className="mb-6">
            This Privacy Policy describes how The Heart Next Door LLC ("we," "us," or "our") collects, uses, and protects information from users ("you") of The Heart Next Door App (the "App"). By using the App, you agree to the terms of this Privacy Policy and our Terms & Conditions.
          </p>

          <h2 className="text-2xl font-bold text-deep-teal mt-8 mb-4">1. Information We Collect</h2>
          
          <p className="mb-4">We collect only the information needed to provide a safe, personalized, and meaningful experience.</p>

          <h3 className="text-xl font-semibold text-deep-teal mt-6 mb-3">A. Information You Provide</h3>
          <ul className="list-disc pl-6 mb-6">
            <li>Name, email address, and location (city/state) when you create an account.</li>
            <li>Pregnancy or parenting details (e.g., stage of pregnancy or postpartum).</li>
            <li>Messages, responses, or entries submitted through chat, journaling, or check-in features.</li>
            <li>Any additional information you choose to share through forms or surveys.</li>
          </ul>

          <h3 className="text-xl font-semibold text-deep-teal mt-6 mb-3">B. Automatically Collected Information</h3>
          <ul className="list-disc pl-6 mb-6">
            <li>Device type, browser, and operating system.</li>
            <li>IP address and general location (not precise GPS).</li>
            <li>Usage activity such as page views, button clicks, and session duration (for analytics).</li>
          </ul>

          <h3 className="text-xl font-semibold text-deep-teal mt-6 mb-3">C. Cookies & Analytics</h3>
          <p className="mb-6">
            We use standard cookies and analytics tools (like Google Analytics or Replit Analytics) to improve performance and understand how users interact with the App. You can manage or disable cookies through your device settings.
          </p>

          <h2 className="text-2xl font-bold text-deep-teal mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="mb-4">We use the information we collect to:</p>
          <ul className="list-disc pl-6 mb-6">
            <li>Provide and personalize your App experience.</li>
            <li>Match you with relevant maternal health and wellness resources.</li>
            <li>Send updates, reminders, and educational materials.</li>
            <li>Improve our products, features, and services.</li>
            <li>Respond to questions or support requests.</li>
            <li>Maintain App security and prevent misuse.</li>
          </ul>
          <p className="mb-6">
            We may use de-identified, aggregated data (never personal details) to measure outcomes, improve services, and share insights with trusted partners or funders.
          </p>

          <h2 className="text-2xl font-bold text-deep-teal mt-8 mb-4">3. How We Protect Your Information</h2>
          <p className="mb-4">
            We implement administrative, technical, and physical safeguards to protect your information. Examples include:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Data encryption during transmission (HTTPS).</li>
            <li>Limited staff access based on job role.</li>
            <li>Secure storage in encrypted databases.</li>
          </ul>
          <p className="mb-6">
            Despite these safeguards, no online service can guarantee 100% security. You use the App at your own risk.
          </p>

          <h2 className="text-2xl font-bold text-deep-teal mt-8 mb-4">4. Sharing Your Information</h2>
          <p className="mb-4">We do not sell or rent your personal data. We may share limited information in these cases:</p>
          <ul className="list-disc pl-6 mb-6">
            <li><strong>With Your Consent:</strong> If you choose to connect with a "Maternal Changemaker" partner or referral.</li>
            <li><strong>With Service Providers:</strong> Vendors who help operate the App (hosting, analytics, messaging). They are bound by confidentiality agreements.</li>
            <li><strong>For Legal Reasons:</strong> To comply with law, regulation, or legal process.</li>
            <li><strong>In Business Transfers:</strong> If The Heart Next Door merges, sells assets, or reorganizes, your data may transfer as part of that process.</li>
          </ul>

          <h2 className="text-2xl font-bold text-deep-teal mt-8 mb-4">5. HIPAA & Sensitive Information</h2>
          <p className="mb-6">
            The Heart Next Door App is not a covered entity under HIPAA, but we voluntarily uphold its spirit. If we partner with licensed providers who fall under HIPAA, their use of your data will follow HIPAA regulations. We do not store or transmit medical records or diagnostic data without your explicit consent.
          </p>

          <h2 className="text-2xl font-bold text-deep-teal mt-8 mb-4">6. Retention & Deletion</h2>
          <p className="mb-6">
            We retain your information as long as needed to provide the App's services or comply with legal obligations. You can request account deletion at any time by emailing support@theheartnextdoor.com, and we will permanently remove your personal data within 30 days (unless required by law to retain it longer).
          </p>

          <h2 className="text-2xl font-bold text-deep-teal mt-8 mb-4">7. Your Rights</h2>
          <p className="mb-4">Depending on your location, you may have the right to:</p>
          <ul className="list-disc pl-6 mb-6">
            <li>Access and review the personal data we hold about you.</li>
            <li>Request correction or deletion of inaccurate data.</li>
            <li>Withdraw consent for certain uses.</li>
            <li>Opt out of promotional emails.</li>
          </ul>
          <p className="mb-6">
            To exercise these rights, contact privacy@theheartnextdoor.com.
          </p>

          <h2 className="text-2xl font-bold text-deep-teal mt-8 mb-4">8. Children's Privacy</h2>
          <p className="mb-6">
            The App is intended for adult users (18+). We do not knowingly collect personal information from children under 13. If you believe your child has provided us data, please contact us to delete it.
          </p>

          <h2 className="text-2xl font-bold text-deep-teal mt-8 mb-4">9. Updates to This Policy</h2>
          <p className="mb-6">
            We may update this Privacy Policy periodically. We will post the new version in the App with the "last updated" date and, where appropriate, notify you by email. Continued use of the App means you accept the updated policy.
          </p>

          <h2 className="text-2xl font-bold text-deep-teal mt-8 mb-4">10. Contact Us</h2>
          <p className="mb-6">
            The Heart Next Door LLC<br />
            Detroit, MI 48226<br />
            📧 privacy@theheartnextdoor.com
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
