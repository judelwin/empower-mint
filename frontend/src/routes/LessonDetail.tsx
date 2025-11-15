import { useParams } from 'react-router-dom';

function LessonDetail() {
  const { id } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Lesson Detail</h1>
      <p className="text-gray-600">Lesson ID: {id}</p>
      <p className="text-gray-600 mt-4">Lesson content will be implemented here...</p>
    </div>
  );
}

export default LessonDetail;

