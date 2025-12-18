export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-[clamp(2.25rem,5vw,3rem)] font-bebas font-bold mb-8 text-center uppercase">
          Refund Policy
        </h1>
        
        <div className="prose prose-invert max-w-none">
          <h2 className="text-2xl font-bebas text-white mb-4">Refund Policy</h2>
          <p className="text-gray-300 mb-6">
            All sales are final. Refunds are not available for merchandise purchases, 
            registration fees, or other services provided by WCS Basketball.
          </p>
          
          <h2 className="text-2xl font-bebas text-white mb-4">Exceptions</h2>
          <p className="text-gray-300 mb-6">
            In case of program cancellation by WCS Basketball, full refunds will be 
            provided within 30 days of the cancellation notice.
          </p>
          
          <h2 className="text-2xl font-bebas text-white mb-4">Contact</h2>
          <p className="text-gray-300">
            For questions about this policy, please contact us at 
            <a href="mailto:wcsbts@gmail.com" className="text-red-600 hover:underline">
              wcsbts@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
