import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './ThemeSelectorModal.css';

export interface ThemeOption {
  id: string;
  name: string;
  category: 'green' | 'warm' | 'neon';
  emoji: string;
  desc: string;
  accent: string;
  glow: string;
  bg: string;
  surface: string;
}

export const ALL_THEMES: ThemeOption[] = [
  {
    id: 'emerald',
    name: 'Cyber Emerald',
    category: 'green',
    emoji: '🌿',
    desc: 'Deep forest obsidian with electric cyber emerald accents (Default).',
    accent: '#10b981',
    glow: '#00ff88',
    bg: '#060e09',
    surface: '#0d1e15',
  },
  {
    id: 'jade',
    name: 'Neo Jade',
    category: 'green',
    emoji: '💎',
    desc: 'Oceanic deep jade with radiant turquoise and electric mint glow.',
    accent: '#14b8a6',
    glow: '#2dd4bf',
    bg: '#041214',
    surface: '#0a2022',
  },
  {
    id: 'forest',
    name: 'Deep Forest',
    category: 'green',
    emoji: '🌲',
    desc: 'Alpine dark pine wood with bright leaf emerald and moss lime.',
    accent: '#22c55e',
    glow: '#4ade80',
    bg: '#051009',
    surface: '#0c2213',
  },
  {
    id: 'matrix',
    name: 'Digital Matrix',
    category: 'green',
    emoji: '⚡',
    desc: 'Pure dark terminal void with toxic phosphor neon matrix green.',
    accent: '#00ff66',
    glow: '#39ff14',
    bg: '#020904',
    surface: '#06180b',
  },
  {
    id: 'amber',
    name: 'Solar Amber',
    category: 'warm',
    emoji: '☀️',
    desc: 'Matte carbon and titanium with warm solar gold & amber glow.',
    accent: '#f59e0b',
    glow: '#fbbf24',
    bg: '#0e0d0a',
    surface: '#1c180e',
  },
  {
    id: 'flame',
    name: 'Molten Flame',
    category: 'warm',
    emoji: '🔥',
    desc: 'Dark magma graphite with molten copper & blaze flame orange.',
    accent: '#f97316',
    glow: '#fdba74',
    bg: '#110905',
    surface: '#201009',
  },
  {
    id: 'crimson',
    name: 'Neon Ruby',
    category: 'neon',
    emoji: '🍷',
    desc: 'Obsidian control room with vivid ruby crimson & sunset rose.',
    accent: '#f43f5e',
    glow: '#fb7185',
    bg: '#0f0709',
    surface: '#1e0c12',
  },
  {
    id: 'amethyst',
    name: 'Electric Amethyst',
    category: 'neon',
    emoji: '🔮',
    desc: 'Midnight void with radiant ultraviolet amethyst & neon lilac.',
    accent: '#a855f7',
    glow: '#c084fc',
    bg: '#0c0812',
    surface: '#1a1028',
  },
  {
    id: 'cyan',
    name: 'Midnight Cyber',
    category: 'neon',
    emoji: '🌌',
    desc: 'Deep space navy obsidian with electric cyber cyan & sky laser.',
    accent: '#06b6d4',
    glow: '#22d3ee',
    bg: '#050d14',
    surface: '#0a1b2a',
  },
  {
    id: 'stealth',
    name: 'Titanium Stealth',
    category: 'neon',
    emoji: '🪙',
    desc: 'Minimalist slate carbon with sleek platinum & titanium silver glow.',
    accent: '#e2e8f0',
    glow: '#ffffff',
    bg: '#0d0e11',
    surface: '#191c23',
  },
];

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTheme: string;
  onSelectTheme: (themeId: string) => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
  activeTheme,
  onSelectTheme,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'green' | 'warm' | 'neon'>('all');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredThemes = selectedCategory === 'all'
    ? ALL_THEMES
    : ALL_THEMES.filter(t => t.category === selectedCategory);

  return createPortal(
    <div className="theme-modal-overlay" onClick={onClose} id="theme-modal-overlay">
      <div className="theme-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="theme-modal__header">
          <div className="theme-modal__title-group">
            <div className="theme-modal__icon-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
                <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
                <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
                <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
              </svg>
            </div>
            <div>
              <h2 className="theme-modal__title">Theme Customizer</h2>
              <p className="theme-modal__subtitle">Select from 10 high-contrast visual color variants</p>
            </div>
          </div>
          <button className="theme-modal__close-btn" onClick={onClose} title="Close (ESC)">
            ✕
          </button>
        </div>

        {/* Category Tabs */}
        <div className="theme-modal__tabs">
          <button
            className={'theme-modal__tab ' + (selectedCategory === 'all' ? 'theme-modal__tab--active' : '')}
            onClick={() => setSelectedCategory('all')}
          >
            All Variants ({ALL_THEMES.length})
          </button>
          <button
            className={'theme-modal__tab ' + (selectedCategory === 'green' ? 'theme-modal__tab--active' : '')}
            onClick={() => setSelectedCategory('green')}
          >
            🌿 High-Tech Greenish (4)
          </button>
          <button
            className={'theme-modal__tab ' + (selectedCategory === 'warm' ? 'theme-modal__tab--active' : '')}
            onClick={() => setSelectedCategory('warm')}
          >
            ☀️ Industrial Warm (2)
          </button>
          <button
            className={'theme-modal__tab ' + (selectedCategory === 'neon' ? 'theme-modal__tab--active' : '')}
            onClick={() => setSelectedCategory('neon')}
          >
            ⚡ Cyber & Neon (4)
          </button>
        </div>

        {/* Theme Grid */}
        <div className="theme-modal__grid">
          {filteredThemes.map(theme => {
            const isActive = activeTheme === theme.id;
            return (
              <div
                key={theme.id}
                className={'theme-card ' + (isActive ? 'theme-card--active' : '')}
                style={{
                  '--card-accent': theme.accent,
                  '--card-glow': theme.glow,
                } as React.CSSProperties}
                onClick={() => onSelectTheme(theme.id)}
              >
                <div className="theme-card__header">
                  <div className="theme-card__title-row">
                    <span className="theme-card__emoji">{theme.emoji}</span>
                    <span className="theme-card__name">{theme.name}</span>
                  </div>
                  {isActive && (
                    <span className="theme-card__active-badge">
                      ✓ Active
                    </span>
                  )}
                </div>

                <p className="theme-card__desc">{theme.desc}</p>

                {/* Swatches Bar */}
                <div className="theme-card__palette">
                  <div className="theme-card__swatches">
                    <span className="theme-swatch-dot" title="Primary Background" style={{ background: theme.bg }} />
                    <span className="theme-swatch-dot" title="Surface Card" style={{ background: theme.surface }} />
                    <span className="theme-swatch-dot" title="Primary Accent" style={{ background: theme.accent, boxShadow: `0 0 6px ${theme.accent}` }} />
                    <span className="theme-swatch-dot" title="Neon Glow" style={{ background: theme.glow, boxShadow: `0 0 8px ${theme.glow}` }} />
                  </div>
                  <span className="theme-card__palette-label">
                    {theme.id.toUpperCase()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="theme-modal__footer">
          <span className="theme-modal__footer-text">
            Active: <strong>{ALL_THEMES.find(t => t.id === activeTheme)?.name || activeTheme}</strong> (saved automatically)
          </span>
          <button className="theme-modal__done-btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
