import { useParams } from 'react-router-dom';

function ScenarioPlayer() {
  const { id } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Scenario Player</h1>
      <p className="text-gray-600">Scenario ID: {id}</p>
      <p className="text-gray-600 mt-4">Scenario player will be implemented here...</p>
    </div>
  );
}

export default ScenarioPlayer;

