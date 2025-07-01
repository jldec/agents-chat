import { DirData, Frontmatter, PageData } from "./types";

// Default page template for markdown pages
export function PageLayout({ page, siteData, dirData }: { page: PageData, siteData?: Frontmatter, dirData?: DirData }) {
  return (
    <div className="prose m-auto">
      <title>{page.attrs.title}</title>
      <div dangerouslySetInnerHTML={{ __html: page.html }} />
    </div>
  )
}