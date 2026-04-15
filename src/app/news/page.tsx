export default function News() {
  return (
    <div className="bg-navy min-h-screen text-white">
      <section className="py-12" aria-label="News">
        <div className="container max-w-[75rem] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-[clamp(2.25rem,5vw,3rem)] font-bebas font-bold mb-8 text-center uppercase">
            News
          </h1>
          <div className="max-w-2xl mx-auto mt-6 text-center space-y-6">
            <p className="text-neutral-200 font-inter text-base leading-relaxed">
              There are no news articles published here yet. When the program posts
              announcements, they will show on this page.
            </p>
            <p className="text-neutral-400 font-inter text-sm leading-relaxed">
              For updates in the meantime, use the social links in the site footer. For
              program questions, see the About page for how to reach the club.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
