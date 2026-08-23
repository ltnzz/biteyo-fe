import React from 'react';
import { X, FileText, ShieldCheck } from 'lucide-react';
import { termsContent, privacyContent } from '../constants/legalContent';

const iconMap = {
  amber: "bg-amber-100 text-amber-600",
  emerald: "bg-emerald-100 text-emerald-600"
};

export default function LegalModal({ isOpen, onClose, type }) {
  const isTerms = type === 'terms';
  const content = isTerms ? termsContent : privacyContent;
  const ModalIcon = isTerms ? FileText : ShieldCheck;
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${iconMap[content.iconColor]}`}>
              <ModalIcon size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{content.title}</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto text-sm text-gray-600 space-y-5">
          <p className="font-semibold text-gray-800 text-xs uppercase tracking-wider">
            Terakhir diperbarui: {content.lastUpdated}
          </p>
          
          {content.sections.map((section, index) => (
            <div key={index}>
              <h3 className="font-bold text-gray-800 mb-1.5 text-sm">
                {section.heading}
              </h3>
              <p className="leading-relaxed">
                {section.text}
                {section.link && (
                  <a 
                    href={section.link.href} 
                    className="text-pink-500 hover:underline font-medium"
                  >
                    {section.link.text}
                  </a>
                )}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <button 
            onClick={onClose} 
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Saya Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}