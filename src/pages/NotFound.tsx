import { useNavigate } from 'react-router-dom'
import Card from '../components/common/Card'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-md">
        <Card className="p-8 md:p-12 text-center">
          {/* Eye Icon */}
          <div className="text-8xl mb-6">👁️</div>

          {/* 404 Message */}
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            404
          </h1>

          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            <span className="bg-gradient-to-r from-[#4ECDC4] to-[#FFE66D] bg-clip-text text-transparent">
              Page not found
            </span>
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
            But your eyes are doing great! 👍
          </p>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

          {/* Additional Info */}
          <p className="text-gray-500 dark:text-gray-500 mb-6 text-sm">
            The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Back to Home Button */}
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#4ECDC4] to-[#45B7AF] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Back to Home
          </button>

          {/* Footer Tip */}
          <div className="mt-8 text-xs text-gray-400 dark:text-gray-600">
            💡 Remember: Take a break every 20 minutes!
          </div>
        </Card>
      </div>
    </div>
  )
}
