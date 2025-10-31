import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function TermsAndConditions() {
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
          <h1 className="text-3xl font-bold text-deep-teal mb-4">The Heart Next Door App – Terms & Conditions</h1>
          
          <p className="text-sm text-gray-500 mb-6">Last updated: January 2026</p>

          <p className="mb-6">
            Please read these Terms & Conditions ("Terms") carefully before using The Heart Next Door mobile or web application (the "App") operated by The Heart Next Door LLC ("we," "us," or "our").
          </p>

          <p className="mb-6">
            By creating an account or using the App, you agree to these Terms and to our Privacy Policy. If you do not agree, do not use the App.
          </p>

          <h2 className="text-2xl font-bold text-deep-teal mt-8 mb-4">1. Purpose of the App</h2>
          <ul className="list-disc pl-6 mb-6">
            <li>The Heart Next Door App provides educational, informational, and wellness-support resources for new and expecting parents.</li>
            <li>The App does not provide medical, nursing, or professional health-care advice and is not a substitute for consultation with qualified clinicians.</li>
            <li>Always seek the advice of your physician, midwife, or other qualified health provider with any questions regarding a medical condition.</li>
          </ul>

          <h2 className="text-2xl font-bold text-deep-teal mt-8 mb-4">2. Eligibility</h2>
          <ul className="list-disc pl-6 mb-6">
            <li>You must be 18 years or older (or the age of majority in your jurisdiction) to create an account.</li>
            <li>By using the App, you represent that you meet this requirement.</li>
          </ul>

          <h2 className="text-2xl font-bold text-deep-teal mt-8 mb-4">3. Use of the App</h2>
          <p className="mb-4">You agree to:</p>
          <ul className="list-disc pl-6 mb-6">
            <li>Use the App only for lawful, personal, non-commercial purposes.</li>
            <li>Provide accurate information during registration.</li>
            <li>Refrain from uploading, sharing, or transmitting content that is harmful, abusive, defamatory, or infringes others' rights.</li>
          </ul>
          <p className="mb-6">We may suspend or terminate access for violation of these Terms.</p>

          <h2 className="text-2xl font-bold text-deep-teal mt-8 mb-4">4. No Medical Relationship</h2>
          <ul className="list-disc pl-6 mb-6">
            <li>Use of the App does not create a patient-provider relationship between you and The Heart Next Door, its employees, partners, or contributors.</li>
            <li>Any recommendations, articles, chat interactions, or referrals are for informational and emotional-support purposes only.</li>
          </ul>

          <h2 className="text-2xl font-bold text-deep-teal mt-8 mb-4">5. Third-Party Resources & Partners</h2>
          <ul className="list-disc pl-6 mb-6">
            <li>The App may display or link to third-party organizations ("Maternal Changemakers") that provide community or health-related services.</li>
            <li>We do not endorse or control these organizations and are not responsible for their actions, services, or content.</li>
            <li>Use your discretion and consult licensed professionals before engaging any third-party services.</li>
          </ul>

          <h2 className="text-2xl font-bold text-deep-teal mt-8 mb-4">6. Privacy & Data</h2>
          <ul className="list-disc pl-6 mb-6">
            <li>Your privacy matters. Our Privacy Policy explains what information we collect and how we use it.</li>
            <li>By using the App, you consent to those practices.</li>
          </ul>

          <h2 className="text-2xl font-bold text-deep-teal mt-8 mb-4">7. Disclaimers of Warranty</h2>
          <p className="mb-4">The App is provided "as is" and "as available."</p>
          <p className="mb-4">We make no warranties or representations, express or implied, about:</p>
          <ul className="list-disc pl-6 mb-6">
            <li>The accuracy or completeness of any content;</li>
            <li>Continuous or error-free operation; or</li>
            <li>The results of using the App.</li>
          </ul>
          <p className="mb-6">To the fullest extent permitted by law, we disclaim all implied warranties, including merchantability, fitness for a particular purpose, and non-infringement.</p>

          <h2 className="text-2xl font-bold text-deep-teal mt-8 mb-4">8. Limitation of Liability</h2>
          <p className="mb-6">
            To the maximum extent permitted by law, The Heart Next Door LLC, its founders, employees, partners, and affiliates shall not be liable for any indirect, incidental, consequential, special, or punitive damages, or for any loss of data, profits, goodwill, or other intangible losses, arising out of or relating to your use of (or inability to use) the App.
          </p>
          <p className="mb-6">
            If liability is found, our total liability shall not exceed USD $100 or the amount you paid for the App in the past 12 months, whichever is less.
          </p>

          <h2 className="text-2xl font-bold text-deep-teal mt-8 mb-4">9. Indemnification</h2>
          <p className="mb-6">
            You agree to defend, indemnify, and hold harmless The Heart Next Door LLC and its affiliates from any claim, liability, damages, losses, or expenses (including reasonable attorneys' fees) arising from your use of the App, violation of these Terms, or infringement of any rights of a third party.
          </p>

          <h2 className="text-2xl font-bold text-deep-teal mt-8 mb-4">10. Intellectual Property</h2>
          <p className="mb-6">
            All trademarks, logos, text, graphics, and code within the App are the property of The Heart Next Door LLC or its licensors and are protected by applicable intellectual-property laws. You may not reproduce, distribute, or create derivative works without written permission.
          </p>

          <h2 className="text-2xl font-bold text-deep-teal mt-8 mb-4">11. Termination</h2>
          <p className="mb-6">
            We may suspend or terminate your access at any time, with or without notice, if we believe you have violated these Terms or used the App in a harmful way.
          </p>

          <h2 className="text-2xl font-bold text-deep-teal mt-8 mb-4">12. Governing Law</h2>
          <p className="mb-6">
            These Terms are governed by the laws of the State of Michigan, without regard to its conflict-of-law principles. Any disputes shall be resolved in the state or federal courts located in Wayne County, Michigan.
          </p>

          <h2 className="text-2xl font-bold text-deep-teal mt-8 mb-4">13. Changes to These Terms</h2>
          <p className="mb-6">
            We may update these Terms occasionally. The "last updated" date will reflect any changes. Continued use of the App means you accept the revised Terms.
          </p>

          <h2 className="text-2xl font-bold text-deep-teal mt-8 mb-4">14. Contact Us</h2>
          <p className="mb-6">
            If you have questions about these Terms, contact:<br />
            The Heart Next Door LLC<br />
            Detroit, MI 48226<br />
            📧 support@theheartnextdoor.com
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
