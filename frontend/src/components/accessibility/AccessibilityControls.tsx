import { useUser } from '../../context/UserContext.js';
import { FontSize, ColorblindMode } from '../../types/user.js';
import Card from '../ui/Card.js';
import Button from '../ui/Button.js';

export default function AccessibilityControls() {
  const { userProfile, updateAccessibility } = useUser();

  if (!userProfile) {
    return (
      <div className="text-center py-8 text-gray-600">
        Please complete onboarding to access accessibility settings.
      </div>
    );
  }

  const { accessibility } = userProfile;

  const handleFontSizeChange = (fontSize: FontSize) => {
    updateAccessibility({ fontSize });
  };

  const handleHighContrastToggle = () => {
    updateAccessibility({ highContrast: !accessibility.highContrast });
  };

  const handleColorblindModeChange = (mode: ColorblindMode) => {
    updateAccessibility({ colorblindMode: mode });
  };

  return (
    <div className="space-y-6">
      {/* Font Size */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Font Size</h3>
        <p className="text-sm text-gray-600 mb-4">
          Adjust the font size to make text easier to read.
        </p>
        <div className="flex gap-3">
          <Button
            variant={accessibility.fontSize === 'small' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleFontSizeChange('small')}
          >
            Small
          </Button>
          <Button
            variant={accessibility.fontSize === 'medium' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleFontSizeChange('medium')}
          >
            Medium
          </Button>
          <Button
            variant={accessibility.fontSize === 'large' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleFontSizeChange('large')}
          >
            Large
          </Button>
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p style={{ fontSize: accessibility.fontSize === 'small' ? '14px' : accessibility.fontSize === 'medium' ? '16px' : '18px' }}>
            This is how text will look at {accessibility.fontSize} size.
          </p>
        </div>
      </Card>

      {/* High Contrast */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">High Contrast Mode</h3>
        <p className="text-sm text-gray-600 mb-4">
          Increase contrast between text and background for better visibility.
        </p>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={accessibility.highContrast}
            onChange={handleHighContrastToggle}
            className="mr-3 w-5 h-5 text-primary-600 focus-ring rounded"
          />
          <span className="font-medium">Enable High Contrast</span>
        </label>
        {accessibility.highContrast && (
          <div className="mt-4 p-4 bg-black text-white rounded-lg">
            <p className="font-semibold">High contrast mode is active. This improves readability for many users.</p>
          </div>
        )}
      </Card>

      {/* Colorblind Mode */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Colorblind Mode</h3>
        <p className="text-sm text-gray-600 mb-4">
          Adjust colors to be more accessible for colorblind users.
        </p>
        <div className="space-y-3">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="colorblind"
              value="none"
              checked={accessibility.colorblindMode === 'none'}
              onChange={() => handleColorblindModeChange('none')}
              className="mr-3 w-5 h-5 text-primary-600 focus-ring"
            />
            <span className="font-medium">None (Default)</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="colorblind"
              value="protanopia"
              checked={accessibility.colorblindMode === 'protanopia'}
              onChange={() => handleColorblindModeChange('protanopia')}
              className="mr-3 w-5 h-5 text-primary-600 focus-ring"
            />
            <span className="font-medium">Protanopia (Red-Blind)</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="colorblind"
              value="deuteranopia"
              checked={accessibility.colorblindMode === 'deuteranopia'}
              onChange={() => handleColorblindModeChange('deuteranopia')}
              className="mr-3 w-5 h-5 text-primary-600 focus-ring"
            />
            <span className="font-medium">Deuteranopia (Green-Blind)</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="colorblind"
              value="tritanopia"
              checked={accessibility.colorblindMode === 'tritanopia'}
              onChange={() => handleColorblindModeChange('tritanopia')}
              className="mr-3 w-5 h-5 text-primary-600 focus-ring"
            />
            <span className="font-medium">Tritanopia (Blue-Blind)</span>
          </label>
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="h-12 rounded mb-2" style={{ backgroundColor: '#0284c7' }}></div>
              <p className="text-xs text-gray-600">Primary Color</p>
            </div>
            <div className="flex-1">
              <div className="h-12 rounded mb-2" style={{ backgroundColor: '#d946ef' }}></div>
              <p className="text-xs text-gray-600">Secondary Color</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Colors may appear different based on your colorblind mode selection.
          </p>
        </div>
      </Card>

      {/* Keyboard Navigation Info */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Keyboard Navigation</h3>
        <p className="text-sm text-gray-600 mb-4">
          All interactive elements can be accessed using keyboard navigation.
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-3">
            <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Tab</kbd>
            <span className="text-gray-700">Navigate between elements</span>
          </div>
          <div className="flex items-center gap-3">
            <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Enter</kbd>
            <span className="text-gray-700">Activate buttons and links</span>
          </div>
          <div className="flex items-center gap-3">
            <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Space</kbd>
            <span className="text-gray-700">Activate checkboxes and radio buttons</span>
          </div>
          <div className="flex items-center gap-3">
            <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Esc</kbd>
            <span className="text-gray-700">Close modals and dialogs</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

