import React from 'react';
import { TopNavigation } from './components/panels/TopNavigation';
import { MindMapCanvas } from './components/canvas/MindMapCanvas';
import { NodeDetailsPanel } from './components/panels/NodeDetailsPanel';
import { SearchModal } from './components/panels/SearchModal';
import { ExportImportModal } from './components/panels/ExportImportModal';
import { ShortcutsDialog } from './components/panels/ShortcutsDialog';
import { TimelineModal } from './components/panels/TimelineModal';
import { CourtDocModal } from './components/panels/CourtDocModal';
import { ShareModal } from './components/panels/ShareModal';
import { TemplatesModal } from './components/panels/TemplatesModal';

export const App: React.FC = () => {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background font-sans text-zinc-100 flex flex-col">
      {/* Top Judicial Header & Navigation Controls */}
      <TopNavigation />

      {/* Main Legal Mind Map Workspace (Canvas + Integrated Right Sidebar) */}
      <div className="flex-1 w-full h-[calc(100vh-3.5rem)] relative overflow-hidden flex">
        <main className="flex-1 h-full relative overflow-hidden">
          <MindMapCanvas />
        </main>
        <NodeDetailsPanel />
      </div>

      {/* Quick Search & Command Palette Modal (Cmd+F) */}
      <SearchModal />

      {/* Export & Import Dialog (Markdown, PNG, SVG, JSON) */}
      <ExportImportModal />

      {/* Case Chronology & Timeline Modal */}
      <TimelineModal />

      {/* Court Legal Memorandum & Evidence Registry Modal */}
      <CourtDocModal />

      {/* Instant Case Sharing Link Modal */}
      <ShareModal />

      {/* Case Templates Gallery Modal */}
      <TemplatesModal />

      {/* Keyboard Shortcuts Reference Dialog (?) */}
      <ShortcutsDialog />
    </div>
  );
};

export default App;
