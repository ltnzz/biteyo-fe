const ads = [
  {
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
    title: "Taste Jakarta Weekend",
    description: "Discover curated food spots and limited menu drops around the city.",
  },
  {
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
    title: "Cafe Pass",
    description: "Get special offers for cozy cafes, desserts, and late-night bites.",
  },
  {
    image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=600&q=80",
    title: "BiteYo Picks",
    description: "Try trending restaurants loved by food explorers near you.",
  },
];

export default function AdvertisementSidebar() {
  return (
    <aside className="hidden lg:block lg:w-80 xl:w-96 2xl:w-[26rem] shrink-0">
      <div className="sticky top-[86px] space-y-4 px-4">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <div className="border-b border-gray-200 bg-gray-50/90 px-4 py-3">
            <h2 className="text-base font-extrabold text-gray-900">Sponsored</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {ads.map((ad) => (
              <article key={ad.title} className="bg-white p-4 transition-colors hover:bg-gray-50/70">
                <img
                  src={ad.image}
                  alt={ad.title}
                  className="h-28 w-full rounded-xl border border-gray-200 object-cover xl:h-36"
                  loading="lazy"
                />
                <h3 className="mt-3 text-sm font-extrabold text-gray-900">
                  {ad.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">
                  {ad.description}
                </p>
                <button
                  type="button"
                  className="mt-3 w-full rounded-full bg-gray-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-pink-500"
                >
                  Learn More
                </button>
              </article>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
