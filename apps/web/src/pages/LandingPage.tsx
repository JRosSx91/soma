import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TrophyIcon } from '../features/achievements/components/TrophyIcon.js';
import heroImage from '../assets/soma-hero.png';
import { motion } from 'framer-motion';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

export function LandingPage() {
  const { t } = useTranslation('landing');

  return (
    <div className="min-h-screen bg-soma-bg-base text-soma-fg-primary">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease }}
            >
              {t('hero.title')}
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl text-soma-fg-secondary max-w-xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease }}
            >
              {t('hero.subtitle')}
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-2"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease }}
            >
              <Link
                to="/register"
                className="
                  inline-block px-8 py-3 rounded
                  bg-soma-accent text-soma-bg-base
                  font-semibold text-lg
                  hover:bg-soma-accent-hover
                  transition-colors text-center
                "
              >
                {t('hero.cta')}
              </Link>
              <Link
                to="/login"
                className="
                  inline-block px-8 py-3 rounded
                  border border-soma-border-subtle
                  text-soma-fg-secondary
                  hover:text-soma-fg-primary hover:border-soma-fg-muted
                  transition-colors text-center
                "
              >
                {t('hero.login')}
              </Link>
            </motion.div>
          </div>

          <motion.div
            className="flex-1 flex justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease }}
          >
            <div className="relative w-full max-w-md">
              <motion.div
                className="absolute inset-0 rounded-2xl blur-3xl"
                style={{
                  background:
                    'radial-gradient(circle at 50% 40%, var(--soma-organ-damaged) 0%, transparent 70%)',
                }}
                animate={{ opacity: [0.2, 0.35, 0.2] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                aria-hidden="true"
              />
              <img
                src={heroImage}
                alt="Soma 3D anatomical model showing organ recovery states"
                className="relative w-full h-auto rounded-2xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6">
        <hr className="border-soma-border-subtle/30" />
      </div>

      {/* ── What is Soma ─────────────────────────────────────── */}
      <motion.section
        className="max-w-4xl mx-auto px-6 py-20 md:py-28"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, ease }}
      >
        <motion.p
          className="text-[11px] uppercase tracking-[0.2em] text-soma-fg-muted mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease }}
        >
          {t('what.eyebrow')}
        </motion.p>
        <motion.h2
          className="text-3xl md:text-4xl font-bold mb-8 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.1, ease }}
        >
          {t('what.title')}
        </motion.h2>
        <div className="space-y-5 text-soma-fg-secondary text-lg leading-relaxed max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.2, ease }}
          >
            {t('what.p1')}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.3, ease }}
          >
            {t('what.p2')}
          </motion.p>
          <motion.p
            className="text-soma-accent italic"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.4, ease }}
          >
            {t('what.p3')}
          </motion.p>
        </div>
      </motion.section>

      <div className="max-w-4xl mx-auto px-6">
        <hr className="border-soma-border-subtle/30" />
      </div>

      {/* ── How it works ─────────────────────────────────────── */}
      <motion.section
        className="max-w-4xl mx-auto px-6 py-20 md:py-28"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, ease }}
      >
        <motion.p
          className="text-[11px] uppercase tracking-[0.2em] text-soma-fg-muted mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease }}
        >
          {t('how.eyebrow')}
        </motion.p>
        <motion.h2
          className="text-3xl md:text-4xl font-bold mb-12 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.1, ease }}
        >
          {t('how.title')}
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <motion.div
              key={n}
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.15 * n, ease }}
            >
              <div className="w-10 h-10 rounded-full bg-soma-accent/15 border border-soma-accent/30 flex items-center justify-center text-soma-accent font-bold text-lg">
                {n}
              </div>
              <h3 className="text-xl font-semibold">
                {t(`how.step${n}_title`)}
              </h3>
              <p className="text-soma-fg-secondary leading-relaxed">
                {t(`how.step${n}_desc`)}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <div className="max-w-4xl mx-auto px-6">
        <hr className="border-soma-border-subtle/30" />
      </div>

      {/* ── Science ──────────────────────────────────────────── */}
      <motion.section
        className="max-w-4xl mx-auto px-6 py-20 md:py-28"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, ease }}
      >
        <motion.p
          className="text-[11px] uppercase tracking-[0.2em] text-soma-fg-muted mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease }}
        >
          {t('science.eyebrow')}
        </motion.p>
        <motion.h2
          className="text-3xl md:text-4xl font-bold mb-8 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.1, ease }}
        >
          {t('science.title')}
        </motion.h2>
        <div className="space-y-5 text-soma-fg-secondary text-lg leading-relaxed max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.2, ease }}
          >
            {t('science.p1')}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.3, ease }}
          >
            {t('science.p2')}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.4, ease }}
          >
            {t('science.p3')}
          </motion.p>
        </div>

        <motion.div
          className="mt-10 flex flex-wrap gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.5, ease }}
        >
          {(['high', 'medium', 'low'] as const).map((level) => (
            <div key={level} className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  level === 'high'
                    ? 'bg-soma-confidence-high'
                    : level === 'medium'
                      ? 'bg-soma-confidence-medium'
                      : 'bg-soma-confidence-low'
                }`}
              />
              <span className="text-sm text-soma-fg-muted capitalize">
                {level}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.section>

      <div className="max-w-4xl mx-auto px-6">
        <hr className="border-soma-border-subtle/30" />
      </div>

      {/* ── Trophies ─────────────────────────────────────────── */}
      <motion.section
        className="max-w-4xl mx-auto px-6 py-20 md:py-28"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, ease }}
      >
        <motion.p
          className="text-[11px] uppercase tracking-[0.2em] text-soma-fg-muted mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease }}
        >
          {t('trophies.eyebrow')}
        </motion.p>
        <motion.h2
          className="text-3xl md:text-4xl font-bold mb-4 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.1, ease }}
        >
          {t('trophies.title')}
        </motion.h2>
        <motion.p
          className="text-soma-fg-secondary text-lg leading-relaxed max-w-3xl mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.2, ease }}
        >
          {t('trophies.p1')}
        </motion.p>

        <div className="space-y-4 max-w-2xl">
          {([
            { tier: 'bronze' as const, key: 'example1', delay: 0.3 },
            { tier: 'gold' as const, key: 'example2', delay: 0.45 },
            { tier: 'platinum' as const, key: 'example3', delay: 0.6 },
          ]).map(({ tier, key, delay }) => (
            <motion.div
              key={key}
              className="
                flex items-start gap-4 p-4
                bg-soma-bg-surface border border-soma-border-subtle
                rounded relative overflow-hidden
              "
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay, ease }}
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{
                  backgroundColor:
                    tier === 'bronze' ? '#CD7F32'
                    : tier === 'gold' ? '#FFD700'
                    : '#E5E4E2',
                }}
                aria-hidden="true"
              />
              <div className="pl-2">
                <TrophyIcon tier={tier} unlocked={true} size={44} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-soma-fg-primary">
                  {t(`trophies.${key}_title`)}
                </p>
                <p className="text-[12px] text-soma-fg-secondary mt-1 leading-relaxed">
                  {t(`trophies.${key}_desc`)}
                </p>
              </div>
            </motion.div>
          ))}

          <motion.div
            className="
              flex items-center gap-4 p-4
              bg-soma-bg-surface/50 border border-soma-border-subtle/50
              rounded relative overflow-hidden
            "
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.75, ease }}
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-1 bg-soma-fg-muted/30"
              aria-hidden="true"
            />
            <div className="pl-2">
              <TrophyIcon tier="silver" unlocked={false} size={44} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-soma-fg-muted">???</p>
              <p className="text-[12px] text-soma-fg-muted/70 mt-1 italic">
                {t('trophies.hidden_note')}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ── Footer CTA ───────────────────────────────────────── */}
      <section className="border-t border-soma-border-subtle/30">
        <motion.div
          className="max-w-4xl mx-auto px-6 py-16 md:py-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease }}
        >
          <p className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">
            {t('footer.tagline')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="
                inline-block px-8 py-3 rounded
                bg-soma-accent text-soma-bg-base
                font-semibold text-lg
                hover:bg-soma-accent-hover
                transition-colors
              "
            >
              {t('footer.cta')}
            </Link>
            <Link
              to="/login"
              className="
                inline-block px-8 py-3 rounded
                border border-soma-border-subtle
                text-soma-fg-secondary
                hover:text-soma-fg-primary hover:border-soma-fg-muted
                transition-colors
              "
            >
              {t('footer.login')}
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}