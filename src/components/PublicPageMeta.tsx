import pages from '../../backend/functions/src/publicPages.json';
import PageMeta from './PageMeta';
export default function PublicPageMeta({ path }: { path: string }) {
  const page = pages.find(page => page.path === path);
  return page ? <PageMeta title={page.title} description={page.description} path={path} /> : null;
}
