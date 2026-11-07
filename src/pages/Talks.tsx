import { useSite } from '../app/SiteContext';
import { Seo } from '../app/seo';
import { PageHeader } from '../components/ui';
import { TalkList } from '../features/talks/TalkList';

export function TalksPage() {
  const { t, text } = useSite();
  return (
    <>
      <Seo title={t('talks.title')} description={text.seo?.talks ?? ''} />
      <PageHeader kicker={t('talks.kicker')} title={t('talks.title')} intro={t('talks.intro')} />
      <section className="section section--tight container">
        <TalkList />
      </section>
    </>
  );
}
