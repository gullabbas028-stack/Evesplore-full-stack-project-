import LegalPage from "@/components/LegalPage";

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      sections={[
        { h: "1. Information We Collect", p: "We collect personal information you provide when creating an account, booking events, or contacting support, including your name, email, phone number and payment details processed securely via Stripe." },
        { h: "2. How We Use Your Data", p: "We use your data to process bookings, deliver e-tickets, send confirmations, provide customer support and improve our services. We never sell your personal information." },
        { h: "3. Data Security", p: "Your data is protected using 256-bit SSL encryption. Passwords are hashed with bcrypt and payment information is never stored on our servers." },
        { h: "4. Cookies", p: "We use essential cookies for authentication and functionality. You can control cookie preferences through your browser settings." },
        { h: "5. Your Rights", p: "You have the right to access, update or delete your personal data at any time through your profile settings or by contacting support." },
      ]}
    />
  );
}
