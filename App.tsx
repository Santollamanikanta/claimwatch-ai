
import React, { useState } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AnalysisPage from './components/AnalysisPage';

type Page = 'dashboard' | 'analysis';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const navigateToAnalysis = () => {
    setCurrentPage('analysis');
  };

  const navigateToDashboard = () => {
    setCurrentPage('dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogoClick={navigateToDashboard}/>
      <main>
        {currentPage === 'dashboard' && <Dashboard onStartAnalysis={navigateToAnalysis} />}
        {currentPage === 'analysis' && <AnalysisPage />}
      </main>
    </div>
  );
};

export default App;
