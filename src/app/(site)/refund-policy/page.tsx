import LegalPage from "@/components/LegalPage";

export default function Refund() {
  return (
    <LegalPage
      title="Refund Policy"
      sections={[
        { h: "1. Cancellation by User", p: "You may cancel eligible bookings before the event date through My Bookings. Refunds are processed to your original payment method within 5-7 business days." },
        { h: "2. Refund Eligibility", p: "Full refunds are available for cancellations made at least 48 hours before the event. Cancellations within 48 hours may be subject to a partial refund." },
        { h: "3. Booking & Service Fees", p: "Booking and service fees are non-refundable unless the event is cancelled by the organizer." },
        { h: "4. Event Cancellation", p: "If an event is cancelled by the organizer, you will receive a full refund including all fees, automatically to your original payment method." },
        { h: "5. How to Request a Refund", p: "Simply cancel your booking from My Bookings, or contact our support team at support@evesplore.com for assistance." },
      ]}
    />
  );
}
