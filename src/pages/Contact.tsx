import { useState } from 'react';
import { useSite } from '../app/SiteContext';
import { Seo } from '../app/seo';
import { resumeUrl } from '../lib/content';
import { ExternalLink } from '../components/Links';
import { Icon } from '../components/Icon';
import { Reveal } from '../components/Reveal';

/** Big closing call-to-action. Static-host friendly: no form, no backend, no secrets in the bundle. */
export function ContactBlock({ headingId, as: H = 'h2' }: { headingId: string; as?: 'h1' | 'h2' }) {
  const { content, locale, t, text } = useSite();
  const [copied, setCopied] = useState(false);
  const email = content.site.email;
  const links = content.social.links.filter((l) => l.enabled && l.placements.includes('contact') && l.id !== 'email');
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };
  return (
    <div className="contact container">
      <p className="label contact__kicker">{t('contact.kicker')}</p>
      <H className="contact__title" id={headingId}>
        {(text.contact?.title ?? []).map((line, i, arr) => (
          <span key={i} className={i === arr.length - 1 ? 'serif accent' : ''}>
            {line}
            {i < arr.length - 1 && <br />}
          </span>
        ))}
      </H>
      <Reveal className="contact__grid">
        <p className="contact__lead">{text.contact?.lead}</p>
        <div className="contact__email">
          <a href={`mailto:${email}`} className="contact__email-link">
            {email}
          </a>
          <button type="button" className="button button--ghost button--small" onClick={copy} aria-live="polite">
            <Icon name={copied ? 'check' : 'copy'} size={15} />
            {copied ? t('contact.copied') : t('contact.copy')}
          </button>
        </div>
        <div className="contact__elsewhere">
          <p className="label">{t('contact.elsewhere')}</p>
          <ul role="list">
            {links.map((l) => (
              <li key={l.id}>
                <ExternalLink href={l.url} className="contact__social">
                  <Icon name={l.id} size={18} /> {l.label}
                </ExternalLink>
              </li>
            ))}
            <li>
              <a href={resumeUrl(content, locale)} className="contact__social" download>
                <Icon name="download" size={18} /> {t('contact.resume')}
              </a>
            </li>
          </ul>
        </div>
      </Reveal>
    </div>
  );
}

export function ContactPage() {
  const { t, text } = useSite();
  return (
    <>
      <Seo title={t('nav.contact')} description={text.seo?.contact ?? ''} />
      <section className="section section--contact section--page-top">
        <ContactBlock headingId="contact-title" as="h1" />
      </section>
    </>
  );
}
