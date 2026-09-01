"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { api } from "@/lib/client";
import EventCard, { EventLite } from "@/components/EventCard";
import { Button, Skeleton, Select, EmptyState } from "@/components/ui";

const CATEGORIES = ["All", "Music", "Concerts", "Sports", "Theater", "Comedy", "Festivals", "Workshops", "Conferences", "Family", "Arts"];
const SORTS = [
  { v: "popular", l: "Most Popular" },
  { v: "newest", l: "Newest" },
  { v: "price_asc", l: "Price: Low to High" },
  { v: "price_desc", l: "Price: High to Low" },
];

function EventsInner() {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [category, setCategory] = useState(params.get("category") || "All");
  const [sort, setSort] = useState("popular");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [events, setEvents] = useState<EventLite[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchEvents = useCallback(
    async (pageNum: number, append: boolean) => {
      const sp = new URLSearchParams();
      if (q) sp.set("q", q);
      if (category !== "All") sp.set("category", category);
      sp.set("sort", sort);
      if (minPrice) sp.set("minPrice", minPrice);
      if (maxPrice) sp.set("maxPrice", maxPrice);
      sp.set("page", String(pageNum));
      sp.set("limit", "12");
      if (!append) setEvents(null);
      else setLoadingMore(true);
      try {
        const d = await api<{ events: EventLite[]; total: number }>(`/events?${sp.toString()}`);
        setTotal(d.total);
        setEvents((prev) => (append && prev ? [...prev, ...d.events] : d.events));
      } catch {
        setEvents([]);
      } finally {
        setLoadingMore(false);
      }
    },
    [q, category, sort, minPrice, maxPrice]
  );

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      setPage(1);
      fetchEvents(1, false);
    }, 350);
    return () => { if (debounce.current) clearTimeout(debounce.current); };
  }, [fetchEvents]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchEvents(next, true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-white">Discover Events</h1>
        <p className="text-slate-400 mt-1">Find and book tickets to the best live events</p>
      </div>

      {/* Search & sort */}
      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by event, artist, venue or city..."
            className="w-full bg-[#10182b] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>
        <div className="w-full md:w-52">
          <Select value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORTS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
          </Select>
        </div>
        <Button variant="outline" onClick={() => setShowFilters((s) => !s)}>
          <SlidersHorizontal size={16} /> Filters
        </Button>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition border ${
              category === c
                ? "gradient-btn text-white border-transparent"
                : "bg-[#10182b] text-slate-300 border-white/10 hover:border-violet-500/40"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {showFilters && (
        <div className="bg-[#10182b] border border-white/[0.06] rounded-2xl p-5 mb-6 grid sm:grid-cols-3 gap-4">
          <label className="block">
            <span className="text-sm text-slate-300 mb-1.5 block">Min Price (PKR)</span>
            <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0" className="w-full bg-[#0b1224] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white" />
          </label>
          <label className="block">
            <span className="text-sm text-slate-300 mb-1.5 block">Max Price (PKR)</span>
            <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="10000" className="w-full bg-[#0b1224] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white" />
          </label>
          <div className="flex items-end">
            <Button variant="ghost" onClick={() => { setMinPrice(""); setMaxPrice(""); setCategory("All"); setQ(""); }}>
              <X size={16} /> Clear Filters
            </Button>
          </div>
        </div>
      )}

      <div className="text-sm text-slate-400 mb-4">{total} events found</div>

      {!events ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-80" />)}
        </div>
      ) : events.length === 0 ? (
        <EmptyState title="No events found" subtitle="Try adjusting your search or filters." />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {events.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
          {events.length < total && (
            <div className="flex justify-center mt-10">
              <Button variant="outline" size="lg" loading={loadingMore} onClick={loadMore}>Load More</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-6 py-10"><Skeleton className="h-96" /></div>}>
      <EventsInner />
    </Suspense>
  );
}
