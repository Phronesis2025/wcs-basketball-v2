export const dynamic = 'force-dynamic';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-[clamp(2.25rem,5vw,3rem)] font-bebas font-bold mb-8 text-center uppercase">
          Terms of Service
        </h1>
        
        <div className="prose prose-invert max-w-none">
          <h2 className="text-2xl font-bebas text-white mb-4">Acceptance of Terms</h2>
          <p className="text-gray-300 mb-6">
            By accessing and using WCS Basketball services, you accept and agree to be bound by the terms and provision of this agreement.
          </p>
          
          <h2 className="text-2xl font-bebas text-white mb-4">Use License</h2>
          <p className="text-gray-300 mb-6">
            Permission is granted to temporarily access WCS Basketball materials for personal, non-commercial transitory viewing only.
          </p>
          
          <h2 className="text-2xl font-bebas text-white mb-4">Disclaimer</h2>
          <p className="text-gray-300 mb-6">
            The materials on WCS Basketball&apos;s website are provided on an &apos;as is&apos; basis. WCS Basketball makes no warranties, expressed or implied.
          </p>
          
          <h2 className="text-2xl font-bebas text-white mb-4">Limitations</h2>
          <p className="text-gray-300 mb-6">
            In no event shall WCS Basketball or its suppliers be liable for any damages arising out of the use or inability to use the materials on WCS Basketball&apos;s website.
          </p>
          
          <h2 className="text-2xl font-bebas text-white mb-4">Contact Information</h2>
          <p className="text-gray-300">
            For questions about these Terms of Service, please contact us at 
            <a href="mailto:wcsbts@gmail.com" className="text-red-600 hover:underline">
              wcsbts@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
