import React from 'react';
import { TopNavigation } from './components/panels/TopNavigation';
import { MindMapCanvas } from './components/canvas/MindMapCanvas';
import { NodeDetailsPanel } from './components/panels/NodeDetailsPanel';
import { SearchModal } from './components/panels/SearchModal';
import { ExportImportModal } from './components/panels/ExportImportModal';
import { ShortcutsDialog } from './components/panels/ShortcutsDialog';

export const App: React.FC = () => {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background font-sans text-zinc-100 flex flex-col">
      {/* Top App Header & Controls */}
      <TopNavigation />

      {/* Main Mind Map Canvas Viewport */}
      <main className="flex-1 w-full h-full relative pt-14">
        <MindMapCanvas />
      </main>

      {/* Right Drawer Inspector for Selected Node */}
      <NodeDetailsPanel />

      {/* Quick Search & Command Palette Modal (Cmd+F) */}
      <SearchModal />

      {/* Export & Import Dialog (Markdown, PNG, SVG, JSON) */}
      <ExportImportModal />

      {/* Keyboard Shortcuts Reference Dialog (?) */}
      <ShortcutsDialog />
    </div>
  );
};

export default App;
