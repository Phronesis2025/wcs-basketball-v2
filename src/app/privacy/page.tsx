export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-[clamp(2.25rem,5vw,3rem)] font-bebas font-bold mb-8 text-center uppercase">
          Privacy Policy
        </h1>
        
        <div className="prose prose-invert max-w-none">
          <h2 className="text-2xl font-bebas text-white mb-4">Information We Collect</h2>
          <p className="text-gray-300 mb-6">
            We collect information you provide directly to us, such as when you create an account, 
            register for programs, or contact us for support.
          </p>
          
          <h2 className="text-2xl font-bebas text-white mb-4">How We Use Your Information</h2>
          <p className="text-gray-300 mb-6">
            We use the information we collect to provide, maintain, and improve our services, 
            process transactions, and communicate with you.
          </p>
          
          <h2 className="text-2xl font-bebas text-white mb-4">Information Sharing</h2>
          <p className="text-gray-300 mb-6">
            We do not sell, trade, or otherwise transfer your personal information to third parties 
            without your consent, except as described in this policy.
          </p>
          
          <h2 className="text-2xl font-bebas text-white mb-4">Data Security</h2>
          <p className="text-gray-300 mb-6">
            We implement appropriate security measures to protect your personal information against 
            unauthorized access, alteration, disclosure, or destruction.
          </p>
          
          <h2 className="text-2xl font-bebas text-white mb-4">Contact Us</h2>
          <p className="text-gray-300">
            If you have any questions about this Privacy Policy, please contact us at 
            <a href="mailto:info@wcsbasketball.com" className="text-red-600 hover:underline">
              info@wcsbasketball.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
