import { useUser } from '../context/UserContext.js';
import AccessibilityControls from '../components/accessibility/AccessibilityControls.js';
import Card from '../components/ui/Card.js';
import Button from '../components/ui/Button.js';
import { Link } from 'react-router-dom';

export default function Settings() {
  const { userProfile } = useUser();

  if (!userProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Settings</h1>
          <p className="text-gray-600 mb-6">
            Please complete onboarding to access settings.
          </p>
          <Link to="/onboarding">
            <Button>Start Onboarding</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Settings</h1>
      <p className="text-gray-600 mb-8">
        Customize your EmpowerMint experience to suit your needs.
      </p>

      {/* User Profile Info */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Experience Level</label>
            <p className="text-gray-900 capitalize">{userProfile.experienceLevel}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Learning Style</label>
            <p className="text-gray-900 capitalize">{userProfile.learningStyle}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Risk Comfort</label>
            <p className="text-gray-900">{userProfile.riskComfort}/10</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Financial Goals</label>
            <p className="text-gray-900">
              {userProfile.financialGoals.length > 0
                ? userProfile.financialGoals.join(', ')
                : 'None selected'}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <Link to="/onboarding">
            <Button variant="outline" size="sm">
              Update Profile
            </Button>
          </Link>
        </div>
      </Card>

      {/* Accessibility Settings */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Accessibility Settings</h2>
        <AccessibilityControls />
      </div>

      {/* Educational Disclaimer */}
      <Card className="bg-yellow-50 border-yellow-200">
        <h3 className="text-lg font-semibold mb-2">Educational Disclaimer</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          EmpowerMint is designed for educational purposes only. The content, scenarios, and
          simulations are intended to help you learn about personal finance and investing concepts.
          This application does not provide financial advice, and all information should not be
          considered as recommendations for specific financial decisions.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mt-3">
          Always consult with qualified financial professionals before making significant financial
          decisions. Past performance in simulations does not guarantee future results in real
          investments.
        </p>
      </Card>
    </div>
  );
}
