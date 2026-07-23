import { useState } from 'react';
import { Layers, Image as ImageIcon, Info, Palette, Save, Type, Settings } from 'lucide-react';
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
    <div className="flex flex-col md:flex-row h-screen w-full bg-pink-50 overflow-hidden text-slate-800 font-sans">
      {showValidator && (
        <ValidatorModal 
          theme={theme} 
          onCancel={() => setShowValidator(false)} 
          onConfirm={handleExport} 
        />
      )}
      
      {/* Main Preview Area (Top on Mobile, Right on Desktop) */}
      <main className="flex-1 relative flex items-center justify-center pattern-dots bg-pink-100/50 overflow-hidden min-h-[50vh] md:min-h-0 order-1 md:order-2">
        {/* The Live Preview Canvas */}
        <div className="relative z-10 w-full h-full p-4 md:p-12 flex items-center justify-center overflow-auto">
          <PreviewCanvas />
        </div>
      </main>

      {/* Editor Sidebar (Bottom on Mobile, Left on Desktop) */}
      <aside className="w-full md:w-[400px] bg-white flex flex-col z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:shadow-2xl border-t md:border-t-0 md:border-r border-pink-100 order-2 md:order-1 h-[50vh] md:h-full rounded-t-3xl md:rounded-none overflow-hidden shrink-0">
        <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center shadow-lg shadow-pink-200">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
               <h1 className="font-bold text-slate-800 tracking-tight text-lg leading-tight">Sweet Studio</h1>
               <span className="text-[10px] uppercase font-bold text-pink-400 tracking-wider">Theme Editor</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Vertical Tab Navigation */}
          <div className="w-16 md:w-20 border-r border-slate-100 flex flex-col items-center py-4 gap-2 bg-slate-50 overflow-y-auto hide-scrollbar">
            <TabButton icon={Info} isActive={activeTab === 'info'} onClick={() => setActiveTab('info')} title="General Info" />
            <TabButton icon={Palette} isActive={activeTab === 'colors'} onClick={() => setActiveTab('colors')} title="Colors" />
            <TabButton icon={Type} isActive={activeTab === 'styles'} onClick={() => setActiveTab('styles')} title="Styles" />
            <TabButton icon={ImageIcon} isActive={activeTab === 'background'} onClick={() => setActiveTab('background')} title="Backgrounds" />
            <TabButton icon={Layers} isActive={activeTab === 'ui'} onClick={() => setActiveTab('ui')} title="UI Elements" />
          </div>

          {/* Configuration Panel */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-white custom-scrollbar">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">
              {activeTab === 'info' ? 'General Information' : 
               activeTab === 'colors' ? 'Theme Colors' :
               activeTab === 'styles' ? 'Typography & Styles' :
               activeTab === 'background' ? 'Background Assets' : 'UI Elements'}
            </h2>
            <EditorPanel activeTab={activeTab} />
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 md:p-6 border-t border-slate-100 bg-white z-10 flex gap-3 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
          <button 
            onClick={() => setShowValidator(true)}
            disabled={isExporting}
            className="flex-1 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-400 hover:to-violet-400 text-white py-4 rounded-2xl font-bold text-[15px] transition-all flex items-center justify-center gap-2 shadow-xl shadow-pink-200 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
          >
            {isExporting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><Save className="w-5 h-5" /> Build Theme</>
            )}
          </button>
        </div>
      </aside>

    </div>
  );
}

function TabButton({ icon: Icon, isActive, onClick, title }: { icon: React.ElementType, isActive: boolean, onClick: () => void, title: string }) {
  return (
    <button 
      onClick={onClick}
      className={`p-3 md:p-4 rounded-2xl transition-all relative group flex flex-col items-center justify-center gap-1 ${
        isActive 
          ? 'bg-white text-pink-500 shadow-[0_4px_12px_rgba(236,72,153,0.15)]' 
          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'
      }`}
      title={title}
    >
      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-pink-500 rounded-r-full" />}
      <Icon className="w-5 h-5 md:w-6 md:h-6" />
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

