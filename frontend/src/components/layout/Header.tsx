import { Link } from 'react-router-dom';
import Navigation from './Navigation';

function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="text-2xl font-bold text-primary-600 hover:text-primary-700 focus-ring"
          >
            EmpowerMint
          </Link>
          <Navigation />
        </div>
      </div>
    </header>
  );
}

export default Header;

