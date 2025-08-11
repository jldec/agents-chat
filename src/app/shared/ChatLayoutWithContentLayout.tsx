import { ContentLayout } from "../contentTheme/ContentLayout";

export function ChatLayoutWithContentLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <ContentLayout>
      <h1 className="text-2xl font-bold my-2 px-2">{title}</h1>
      {children}
    </ContentLayout>
  )
}
