import React, { useState } from 'react';
import AdminPaperUploadStudio from '../../components/ExamAI/AdminPaperUploadStudio';
import InteractivePaperViewer from '../../components/ExamAI/InteractivePaperViewer';
import AdminPageLayout from '../../components/AdminPageLayout';

export default function AdminExamStudio() {
  const [selectedPaperForViewer, setSelectedPaperForViewer] = useState(null);

  const handleOpenViewer = (paper) => {
    setSelectedPaperForViewer(paper);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 text-white max-w-7xl mx-auto">
      <AdminPaperUploadStudio onOpenViewer={handleOpenViewer} />

      {selectedPaperForViewer && (
        <InteractivePaperViewer
          paper={selectedPaperForViewer}
          onClose={() => setSelectedPaperForViewer(null)}
        />
      )}
    </div>
  );
}
