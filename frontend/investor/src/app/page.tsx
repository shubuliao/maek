import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero section */}
      <div className="flex flex-col md:flex-row w-full items-center justify-between gap-8 mb-16">
        <div className="w-full md:w-1/2 space-y-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
            Invest in your future with digital assets
          </h1>
          <p className="text-lg text-gray-600">
            Connect your digital wallet, invest in curated opportunities, and track your portfolio growth all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/connect-wallet" 
              className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Connect Wallet
            </Link>
            <Link 
              href="/about" 
              className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              Learn More
            </Link>
          </div>
        </div>
        <div className="w-full md:w-1/2">
          <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-xl overflow-hidden">
            {/* Placeholder for a dashboard or app screenshot */}
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-500">Dashboard Preview</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="w-full space-y-16">
        <h2 className="text-3xl font-bold text-center text-gray-900">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center space-y-4 p-6 bg-white rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <h3 className="text-xl font-medium text-gray-900">Connect your wallet</h3>
            <p className="text-gray-600">
              Securely connect your digital wallet to our platform with just a few clicks.
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4 p-6 bg-white rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">2</span>
            </div>
            <h3 className="text-xl font-medium text-gray-900">Choose investments</h3>
            <p className="text-gray-600">
              Browse through our curated investment opportunities and choose what works for you.
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4 p-6 bg-white rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">3</span>
            </div>
            <h3 className="text-xl font-medium text-gray-900">Track performance</h3>
            <p className="text-gray-600">
              Monitor your investments and track their performance in real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
