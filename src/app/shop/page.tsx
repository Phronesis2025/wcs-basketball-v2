export default function Shop() {
  return (
    <div className="bg-navy min-h-screen text-white">
      <section className="py-12" aria-label="Gear">
        <div className="container max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-[clamp(2.25rem,5vw,3rem)] font-bebas font-bold mb-8 text-center uppercase">
            Gear
          </h1>
          <div className="max-w-2xl mx-auto mt-6 text-center space-y-6">
            <p className="text-neutral-200 font-inter text-base leading-relaxed">
              The online store is not live yet. When merchandise ordering opens, details
              will be posted here.
            </p>
            <p className="text-neutral-400 font-inter text-sm leading-relaxed">
              For club questions in the meantime, use the About page and the contact
              options linked from the site footer.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
