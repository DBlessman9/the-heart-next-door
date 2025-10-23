import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function PrivacyPolicy() {
  const [, setLocation] = useLocation();

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen p-6">
      <button
        onClick={() => setLocation(-1)}
        className="flex items-center text-sage hover:text-sage/80 mb-6"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back
      </button>

      <Card>
        <CardContent className="p-8 prose prose-sm max-w-none">
          <h1 className="text-3xl font-bold text-deep-teal mb-4">Privacy Policy</h1>
          
          <p className="text-sm text-gray-500 mb-6">Last updated: January 2026</p>

          <p className="mb-6">
            At The Heart Next Door ("we," "us," or "our"), we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our mobile or web application (the "App").
          </p>

          <h2 className="text-2xl font-bold text-deep-teal mt-8 mb-4">1. Information We Collect</h2>
          
          <h3 className="text-xl font-semibold text-deep-teal mt-6 mb-3">Personal Information</h3>
          <p className="mb-4">When you create an account, we may collect:</p>
          <ul className="list-disc pl-6 mb-6">
            <li>Name and email address</li>
            <li>Location information (city, state, zip code)</li>
            <li>Pregnancy stage and related wellness information</li>
            <li>Any information you provide in check-ins, journal entries, or chat conversations</li>
          </ul>

          <h3 className="text-xl font-semibold text-deep-teal mt-6 mb-3">Usage Data</h3>
          <p className="mb-4">We automatically collect:</p>
          <ul className="list-disc pl-6 mb-6">
            <li>Device information (type, operating system)</li>
            <li>Usage patterns and interactions with the App</li>
            <li>Log data and analytics</li>
          </ul>

          <h2 className="text-2xl font-bold text-deep-teal mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="mb-4">We use your information to:</p>
          <ul className="list-disc pl-6 mb-6">
            <li>Provide personalized wellness support and resources</li>
            <li>Deliver AI-powered chat support tailored to your pregnancy stage</li>
            <li>Send relevant educational content and affirmations</li>
            <li>Improve our App and user experience</li>
            <li>Communicate with you about updates and features</li>
            <li>Ensure the security and proper functioning of the App</li>
          </ul>

          <h2 className="text-2xl font-bold text-deep-teal mt-8 mb-4">3. Data Sharing and Disclosure</h2>
          <p className="mb-6">
            We do not sell your personal information. We may share your data only in the following circumstances:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li><strong>Service Providers:</strong> We work with trusted third-party service providers (such as cloud hosting and AI services) who help us operate the App. These providers are contractually obligated to protect your data.</li>
            <li><strong>Partner Connections:</strong> If you invite a partner or supporter to connect with you, we will share relevant information with them based on the permissions you set.</li>
            <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect the rights, property, or safety of The Heart Next Door, our users, or others.</li>
          </ul>

          <h2 className="text-2xl font-bold text-deep-teal mt-8 mb-4">4. Data Security</h2>
          <p className="mb-6">
            We implement industry-standard security measures to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h2 className="text-2xl font-bold text-deep-teal mt-8 mb-4">5. Your Rights and Choices</h2>
          <p className="mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 mb-6">
            <li>Access, update, or delete your personal information</li>
            <li>Opt out of certain communications</li>
            <li>Request a copy of your data</li>
            <li>Withdraw consent for data processing</li>
          </ul>
          <p className="mb-6">
            To exercise these rights, please contact us at support@theheartnextdoor.com.
          </p>

          <h2 className="text-2xl font-bold text-deep-teal mt-8 mb-4">6. Data Retention</h2>
          <p className="mb-6">
            We retain your personal information for as long as necessary to provide our services and comply with legal obligations. You may request deletion of your account at any time.
          </p>

          <h2 className="text-2xl font-bold text-deep-teal mt-8 mb-4">7. Children's Privacy</h2>
          <p className="mb-6">
            The App is not intended for individuals under the age of 18. We do not knowingly collect personal information from children.
          </p>

          <h2 className="text-2xl font-bold text-deep-teal mt-8 mb-4">8. Third-Party Links</h2>
          <p className="mb-6">
            The App may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties.
          </p>

          <h2 className="text-2xl font-bold text-deep-teal mt-8 mb-4">9. Changes to This Privacy Policy</h2>
          <p className="mb-6">
            We may update this Privacy Policy from time to time. The "last updated" date will reflect any changes. Continued use of the App constitutes acceptance of the updated policy.
          </p>

          <h2 className="text-2xl font-bold text-deep-teal mt-8 mb-4">10. Contact Us</h2>
          <p className="mb-6">
            If you have questions about this Privacy Policy, please contact:<br />
            The Heart Next Door LLC<br />
            Detroit, MI 48226<br />
            📧 support@theheartnextdoor.com
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
