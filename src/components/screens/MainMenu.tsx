import {
  Search,
  FileText,
  Settings,
  Info,
  LogOut,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import { CustomCard } from '../ui/CustomCard';
import { CustomText } from '../ui/CustomText';
import { CustomButton } from '../ui/CustomButton';
import type { CardVariant } from '../ui/CustomCard';

type Screen = 'analyze' | 'reports' | 'settings' | 'about';

interface MainMenuProps {
  onNavigate: (screen: Screen) => void;
  onExit: () => void;
}

interface MenuEntry {
  screen: Screen;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  variant: CardVariant;
  primary?: boolean;
}

const entries: MenuEntry[] = [
  {
    screen: 'analyze',
    title: 'New Analysis',
    subtitle: 'Upload one or more .eml / .msg files to inspect',
    icon: <Search size={22} />,
    variant: 'primary',
    primary: true,
  },
  {
    screen: 'reports',
    title: 'My Reports',
    subtitle: 'Browse previously analyzed batches',
    icon: <FileText size={22} />,
    variant: 'default',
  },
  {
    screen: 'settings',
    title: 'Settings',
    subtitle: 'Language, theme, and preferences',
    icon: <Settings size={22} />,
    variant: 'default',
  },
  {
    screen: 'about',
    title: 'About',
    subtitle: 'Developer, organization & version info',
    icon: <Info size={22} />,
    variant: 'default',
  },
];

export function MainMenu({ onNavigate, onExit }: MainMenuProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-ink)] px-6 py-12">
      {/* Logo / brand mark */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-[var(--color-evidence)] to-[#a8841f] flex items-center justify-center shadow-[0_8px_32px_rgba(201,162,39,0.35)] mb-5 -rotate-2">
          <ShieldAlert
            size={36}
            className="text-[var(--color-ink)]"
            strokeWidth={2.2}
          />
        </div>
        <CustomText as="h1" variant="h2" align="center">
          OhMyPhishDetective
          <span className="text-[var(--color-evidence)]">!</span>
        </CustomText>
        <CustomText
          variant="body-sm"
          color="muted"
          align="center"
          className="mt-2"
        >
          Email forensic analysis, made simple
        </CustomText>
      </div>

      {/* Menu entries */}
      <div className="w-full max-w-md flex flex-col gap-3">
        {entries.map((entry) => (
          <CustomCard
            key={entry.screen}
            variant={entry.variant}
            padding="md"
            shadow={entry.primary ? 'lg' : 'sm'}
            hoverable
            clickable
            accentBar={entry.primary}
            onCardClick={() => onNavigate(entry.screen)}
            className="group"
          >
            <div className="flex items-center gap-4">
              <div
                className={[
                  'flex items-center justify-center w-12 h-12 rounded-xl shrink-0 transition-transform duration-200 group-hover:scale-105',
                  entry.primary
                    ? 'bg-gradient-to-br from-[var(--color-evidence)] to-[#a8841f] text-[var(--color-ink)]'
                    : 'bg-white/5 text-[var(--color-paper-dim)]',
                ].join(' ')}
              >
                {entry.icon}
              </div>
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <CustomText variant="h6" className="leading-tight">
                  {entry.title}
                </CustomText>
                <CustomText
                  variant="caption"
                  color="muted"
                  className="leading-snug"
                >
                  {entry.subtitle}
                </CustomText>
              </div>
              <ChevronRight
                size={20}
                className="shrink-0 text-[var(--color-paper-dim)] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[var(--color-evidence)]"
              />
            </div>
          </CustomCard>
        ))}
      </div>

      {/* Exit */}
      <div className="mt-10">
        <CustomButton
          label="Exit"
          icon={<LogOut size={16} />}
          variant="flat"
          size="sm"
          onClick={onExit}
        />
      </div>

      <CustomText variant="caption" color="subtle" className="mt-8">
        OhMyOpenSource! — v0.1.0
      </CustomText>
    </div>
  );
}
