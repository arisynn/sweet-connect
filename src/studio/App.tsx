import { useState } from 'react';
import { Layers, Image as ImageIcon, Info, Palette, Save, Play, Settings } from 'lucide-react';
import { ThemeProvider, useThemeContext } from './context/ThemeContext';
import { EditorPanel } from './components/EditorPanel';
import { PreviewCanvas } from './components/PreviewCanvas';
import { ValidatorModal } from './components/ValidatorModal';
import { exportTheme } from './utils/export';

function StudioContent() {
  const [activeTab, setActiveTab] = useState('info');
  const [isExporting, setIsExporting] = useState(false);
  const [showValidator, setShowValidator] = useState(false);
  const { theme } = useThemeContext();

  const handleExport = async () => {
    try {
      setShowValidator(false);
      setIsExporting(true);
      await exportTheme(theme);
    } catch (e) {
      console.error('Export failed:', e);
      alert('Failed to export theme. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 overflow-hidden text-slate-100 font-sans">
      {showValidator && (
        <ValidatorModal 
          theme={theme} 
          onCancel={() => setShowValidator(false)} 
          onConfirm={handleExport} 
        />
      )}
      
      {/* Sidebar / Tools Panel */}
      <aside className="w-80 border-r border-slate-800 bg-slate-900 flex flex-col z-20 shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <h1 className="font-bold text-slate-100 tracking-tight">Sweet Studio</h1>
          </div>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Vertical Tab Navigation */}
          <div className="w-16 border-r border-slate-800 flex flex-col items-center py-4 gap-2 bg-slate-950/50">
            <TabButton icon={Info} isActive={activeTab === 'info'} onClick={() => setActiveTab('info')} title="General Info" />
            <TabButton icon={Palette} isActive={activeTab === 'colors'} onClick={() => setActiveTab('colors')} title="Colors" />
            <TabButton icon={ImageIcon} isActive={activeTab === 'background'} onClick={() => setActiveTab('background')} title="Backgrounds" />
            <TabButton icon={Layers} isActive={activeTab === 'ui'} onClick={() => setActiveTab('ui')} title="UI Elements" />
          </div>

          {/* Configuration Panel */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-900/50">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">
              {activeTab === 'info' ? 'General Information' : 
               activeTab === 'colors' ? 'Theme Colors' :
               activeTab === 'background' ? 'Background Assets' : 'UI Elements'}
            </h2>
            <EditorPanel activeTab={activeTab} />
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-slate-800 flex gap-3 bg-slate-900 z-10">
          <button 
            onClick={() => setShowValidator(true)}
            disabled={isExporting}
            className="flex-1 bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-pink-900/30 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
          >
            {isExporting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><Save className="w-4 h-4" /> Build Theme</>
            )}
          </button>
        </div>
      </aside>

      {/* Main Preview Area */}
      <main className="flex-1 relative flex items-center justify-center bg-slate-950 overflow-hidden">
        {/* Decorative background for workspace */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #334155 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.3 }} />
        
        {/* The Live Preview Canvas */}
        <div className="relative z-10 scale-[0.85] sm:scale-100 transform origin-center transition-transform">
          <PreviewCanvas />
        </div>
      </main>
    </div>
  );
}

function TabButton({ icon: Icon, isActive, onClick, title }: { icon: React.ElementType, isActive: boolean, onClick: () => void, title: string }) {
  return (
    <button 
      onClick={onClick}
      className={`p-3 rounded-xl transition-all relative group ${
        isActive 
          ? 'bg-gradient-to-br from-pink-500/20 to-violet-500/20 text-pink-400 shadow-inner' 
          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
      }`}
      title={title}
    >
      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-pink-500 rounded-r-full" />}
      <Icon className="w-5 h-5" />
    </button>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <StudioContent />
    </ThemeProvider>
  );
}

