import { Link } from 'react-router-dom';
import Button from '../components/ui/Button.js';

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 animate-fadeIn">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Welcome to <span className="text-primary-600">EmpowerMint</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Learn financial literacy and investing through interactive scenarios, 
              personalized AI explanations, and visual simulations.
            </p>
            <p className="text-lg text-gray-700 mb-12 max-w-2xl mx-auto">
              Designed to be inclusive and accessible for everyone, especially underrepresented 
              genders and financially underserved communities.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-slideUp">
            <Link to="/onboarding">
              <Button variant="primary" size="lg">
                Get Started
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" size="lg">
                Continue Learning
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Interactive Lessons</h3>
              <p className="text-gray-600 leading-relaxed">
                Learn financial concepts through micro-lessons with quizzes and AI-powered explanations.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="text-5xl mb-4">🎮</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Gamified Scenarios</h3>
              <p className="text-gray-600 leading-relaxed">
                Make decisions in realistic financial situations and see the consequences.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="text-5xl mb-4">📈</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Wealth Simulator</h3>
              <p className="text-gray-600 leading-relaxed">
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

