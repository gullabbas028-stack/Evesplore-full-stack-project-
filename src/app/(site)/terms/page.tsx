import LegalPage from "@/components/LegalPage";

export default function Terms() {
  return (
    <LegalPage
      title="Terms of Service"
      sections={[
        { h: "1. Acceptance of Terms", p: "By using EVESPLORE, you agree to these Terms of Service. If you do not agree, please do not use our platform." },
        { h: "2. Account Responsibilities", p: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account." },
        { h: "3. Bookings & Tickets", p: "All bookings are subject to availability. Tickets are non-transferable unless stated otherwise. Each QR ticket is valid for single entry only." },
        { h: "4. Payments", p: "Payments are processed securely through Stripe. All prices include applicable booking and service fees displayed at checkout." },
        { h: "5. Prohibited Conduct", p: "You may not resell tickets, use bots, or attempt to circumvent our security measures. Violations may result in account termination." },
        { h: "6. Limitation of Liability", p: "EVESPLORE acts as an intermediary between users and event organizers and is not liable for event cancellations or changes made by organizers." },
      ]}
    />
  );
}
