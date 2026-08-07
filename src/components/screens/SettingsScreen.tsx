import { ArrowLeft, Moon, Sun, Globe, Trash2, Eye } from 'lucide-react';
import { CustomButton } from '../ui/CustomButton';
import { CustomText } from '../ui/CustomText';
import { CustomCard } from '../ui/CustomCard';
import { usePreferences } from '../../lib/preferences';
import { t } from '../../lib/i18n';
import type { Language, Theme } from '../../lib/preferences';

interface SettingsScreenProps {
  onBack: () => void;
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        'relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0',
        checked ? 'bg-[var(--color-evidence)]' : 'bg-white/10',
      ].join(' ')}
    >
      <span
        className={[
          'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  );
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const {
    theme,
    setTheme,
    language,
    setLanguage,
    confirmBeforeDelete,
    setConfirmBeforeDelete,
    showTechnicalDetails,
    setShowTechnicalDetails,
  } = usePreferences();

  const L = (key: Parameters<typeof t>[1]) => t(language, key);

  return (
    <div className="min-h-screen bg-[var(--color-ink)] px-6 py-10 flex flex-col items-center transition-colors duration-300">
      <div className="w-full max-w-lg">
        <CustomButton
          label="Back"
          icon={<ArrowLeft size={16} />}
          variant="flat"
          size="sm"
          onClick={onBack}
          className="mb-6"
        />

        <CustomText as="h1" variant="h3" className="mb-1">
          {L('settingsTitle')}
        </CustomText>
        <CustomText variant="body-sm" color="muted" className="mb-8">
          {L('settingsSubtitle')}
        </CustomText>

        {/* Appearance */}
        <CustomText variant="label" color="muted" className="block mb-2">
          {L('appearance')}
        </CustomText>
        <CustomCard padding="md" shadow="sm" className="mb-6">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon size={18} className="text-[var(--color-paper-dim)]" />
              ) : (
                <Sun size={18} className="text-[var(--color-paper-dim)]" />
              )}
              <CustomText variant="body-sm">{L('theme')}</CustomText>
            </div>
            <div className="flex gap-1 bg-white/5 rounded-lg p-1">
              {(['dark', 'light'] as Theme[]).map((th) => (
                <button
                  key={th}
                  onClick={() => setTheme(th)}
                  className={[
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150',
                    theme === th
                      ? 'bg-[var(--color-evidence)] text-[var(--color-ink)]'
                      : 'text-[var(--color-paper-dim)] hover:text-[var(--color-paper)]',
                  ].join(' ')}
                >
                  {th === 'dark' ? L('themeDark') : L('themeLight')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-white/5 mt-1 pt-3">
            <div className="flex items-center gap-3">
              <Globe size={18} className="text-[var(--color-paper-dim)]" />
              <CustomText variant="body-sm">{L('language')}</CustomText>
            </div>
            <div className="flex gap-1 bg-white/5 rounded-lg p-1">
              {(['en', 'it'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={[
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 uppercase',
                    language === lang
                      ? 'bg-[var(--color-evidence)] text-[var(--color-ink)]'
                      : 'text-[var(--color-paper-dim)] hover:text-[var(--color-paper)]',
                  ].join(' ')}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </CustomCard>

        {/* Behavior */}
        <CustomText variant="label" color="muted" className="block mb-2">
          {L('behavior')}
        </CustomText>
        <CustomCard padding="md" shadow="sm">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Trash2
                size={18}
                className="text-[var(--color-paper-dim)] shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <CustomText variant="body-sm">
                  {L('confirmBeforeDelete')}
                </CustomText>
                <CustomText variant="caption" color="subtle">
                  {L('confirmBeforeDeleteDesc')}
                </CustomText>
              </div>
            </div>
            <Toggle
              checked={confirmBeforeDelete}
              onChange={setConfirmBeforeDelete}
            />
          </div>

          <div className="flex items-center justify-between py-2 border-t border-white/5 mt-1 pt-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Eye
                size={18}
                className="text-[var(--color-paper-dim)] shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <CustomText variant="body-sm">
                  {L('showTechnicalDetails')}
                </CustomText>
                <CustomText variant="caption" color="subtle">
                  {L('showTechnicalDetailsDesc')}
                </CustomText>
              </div>
            </div>
            <Toggle
              checked={showTechnicalDetails}
              onChange={setShowTechnicalDetails}
            />
          </div>
        </CustomCard>
      </div>
    </div>
  );
}
