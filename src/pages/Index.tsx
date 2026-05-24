import { useState } from 'react';
import SidebarNav, { Section } from '@/components/SidebarNav';
import RootFinder from '@/components/RootFinder';
import LinearSystemSolver from '@/components/LinearSystemSolver';
import CurveFitter from '@/components/CurveFitter';

const Index = () => {
  const [section, setSection] = useState<Section>('roots');

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav active={section} onSelect={setSection} />
      <main className="md:ml-64 p-6 md:p-8 pt-16 md:pt-8 max-w-4xl">
        {section === 'roots' && <RootFinder />}
        {section === 'linear' && <LinearSystemSolver />}
        {section === 'curve' && <CurveFitter />}
      </main>
    </div>
  );
};

export default Index;
