export type TicketType = {
  name: string; // VIP, Premium, Standard, Economy
  price: number;
  color: string;
  desc: string;
  icon: string;
};

export type SeatLayout = {
  rows: string[]; // ["A","B",...]
  seatsPerRow: number;
  // map row letter -> category name
  rowCategories: Record<string, string>;
};

export const DEFAULT_TICKET_TYPES: TicketType[] = [
  { name: "VIP", price: 8000, color: "#a855f7", desc: "Best seats & premium experience", icon: "crown" },
  { name: "Premium", price: 5000, color: "#ec4899", desc: "Great view & comfortable seats", icon: "star" },
  { name: "Standard", price: 2500, color: "#f59e0b", desc: "Good view & budget friendly", icon: "ticket" },
  { name: "Economy", price: 1000, color: "#22c55e", desc: "Affordable & value for money", icon: "wallet" },
];

export const DEFAULT_LAYOUT: SeatLayout = {
  rows: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
  seatsPerRow: 15,
  rowCategories: {
    A: "VIP",
    B: "VIP",
    C: "VIP",
    D: "VIP",
    E: "Premium",
    F: "Premium",
    G: "Standard",
    H: "Standard",
    I: "Economy",
    J: "Economy",
  },
};

export type SeatInfo = {
  label: string;
  row: string;
  number: number;
  category: string;
  price: number;
};

export function buildSeats(layout: SeatLayout, ticketTypes: TicketType[]): SeatInfo[] {
  const priceMap = new Map(ticketTypes.map((t) => [t.name, t.price]));
  const seats: SeatInfo[] = [];
  for (const row of layout.rows) {
    const category = layout.rowCategories[row] || "Standard";
    for (let n = 1; n <= layout.seatsPerRow; n++) {
      seats.push({
        label: `${row}${n}`,
        row,
        number: n,
        category,
        price: priceMap.get(category) ?? 2500,
      });
    }
  }
  return seats;
}
