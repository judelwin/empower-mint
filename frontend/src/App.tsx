import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext.js';
import { ProgressProvider } from './context/ProgressContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import AppLayout from './components/layout/AppLayout';
import Landing from './routes/Landing';
import Onboarding from './routes/Onboarding';
import Dashboard from './routes/Dashboard';
import Lessons from './routes/Lessons';
import LessonDetail from './routes/LessonDetail';
import Scenarios from './routes/Scenarios';
import ScenarioPlayer from './routes/ScenarioPlayer';
import Simulator from './routes/Simulator';
import Settings from './routes/Settings';

function App() {
  return (
    <UserProvider>
      <ProgressProvider>
        <ThemeProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route element={<AppLayout />}>
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/lessons" element={<Lessons />} />
                <Route path="/lessons/:id" element={<LessonDetail />} />
                <Route path="/scenarios" element={<Scenarios />} />
                <Route path="/scenarios/:id" element={<ScenarioPlayer />} />
                <Route path="/simulator" element={<Simulator />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </ProgressProvider>
    </UserProvider>
  );
}

export default App;

