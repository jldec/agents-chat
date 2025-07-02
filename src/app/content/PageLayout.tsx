import { DirData, Frontmatter, PageData } from "./types";

// Default page template for markdown pages
export function PageLayout({ page, siteData, dirData }: { page: PageData, siteData?: Frontmatter, dirData?: DirData }) {
  return (
    <div className="prose max-w-2xl m-auto p-3 prose-img:mt-0 prose-p:mt-0 prose-a:text-blue-700 prose-a:whitespace-nowrap prose-hr:my-4">
      <title>{page.attrs.title}</title>
      <div dangerouslySetInnerHTML={{ __html: page.html }} />
    </div>
  )
}