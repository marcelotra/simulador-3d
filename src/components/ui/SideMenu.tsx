import React, { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  price?: number;
}

export const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, title, children, price }) => {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => {
        setIsRendered(false);
        document.body.style.overflow = '';
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered && !isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div 
        className={`relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors group"
          >
            <div className="bg-zinc-100 p-2 rounded-lg group-hover:bg-zinc-200 transition-all">
              <ChevronLeft className="w-5 h-5" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest">Voltar</span>
          </button>
          
          <div className="text-center">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 leading-none mb-1">Passo</h3>
            <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">{title}</span>
          </div>

          <div className="w-20 text-right">
            {price !== undefined && (
              <span className="text-sm font-black text-zinc-900">
                R$ {price.toFixed(2).replace('.', ',')}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
          {children}
        </div>
      </div>
    </div>
  );
};
