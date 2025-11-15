import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-primary-600">EmpowerMint</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Learn financial literacy and investing through interactive scenarios, 
            personalized AI explanations, and visual simulations.
          </p>
          <p className="text-lg text-gray-700 mb-12 max-w-2xl mx-auto">
            Designed to be inclusive and accessible for everyone, especially underrepresented 
            genders and financially underserved communities.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              to="/onboarding"
              className="px-8 py-4 bg-primary-600 text-white rounded-lg font-semibold text-lg hover:bg-primary-700 transition-colors focus-ring"
            >
              Get Started
            </Link>
            <Link
              to="/dashboard"
              className="px-8 py-4 bg-white text-primary-600 border-2 border-primary-600 rounded-lg font-semibold text-lg hover:bg-primary-50 transition-colors focus-ring"
            >
              Continue Learning
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">Interactive Lessons</h3>
              <p className="text-gray-600">
                Learn financial concepts through micro-lessons with quizzes and AI-powered explanations.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-semibold mb-2">Gamified Scenarios</h3>
              <p className="text-gray-600">
                Make decisions in realistic financial situations and see the consequences.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-semibold mb-2">Wealth Simulator</h3>
              <p className="text-gray-600">
                Visualize how your money grows with compound interest over time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;

