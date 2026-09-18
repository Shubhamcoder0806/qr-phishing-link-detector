import React, { useState } from 'react';
import Navbar from './components/Navbar';
import URLScanner from './components/URLScanner';
import QRScanner from './components/QRScanner';
import BatchScanner from './components/BatchScanner';
import PenTesterSuite from './components/PenTesterSuite';
import ScanHistory from './components/ScanHistory';
import DatabaseSearch from './components/DatabaseSearch';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import DatasetGuideModal from './components/DatasetGuideModal';
import Footer from './components/Footer';

export default function App() {
  const [activeTab, setActiveTab] = useState('url');
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenDatasetGuide={() => setIsGuideOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === 'url' && <URLScanner />}
        {activeTab === 'qr' && <QRScanner />}
        {activeTab === 'batch' && <BatchScanner />}
        {activeTab === 'pentest' && <PenTesterSuite />}
        {activeTab === 'history' && <ScanHistory />}
        {activeTab === 'database' && <DatabaseSearch />}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard onOpenDatasetGuide={() => setIsGuideOpen(true)} />
        )}
      </main>

      <DatasetGuideModal 
        isOpen={isGuideOpen} 
        onClose={() => setIsGuideOpen(false)} 
      />

      <Footer />
    </div>
  );
}
