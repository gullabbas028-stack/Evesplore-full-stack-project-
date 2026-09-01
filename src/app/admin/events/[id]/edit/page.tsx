"use client";

import { use } from "react";
import EventForm from "@/components/EventForm";

export default function EditEvent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <EventForm eventId={Number(id)} />;
}
