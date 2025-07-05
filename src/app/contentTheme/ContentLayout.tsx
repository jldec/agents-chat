import { Menu } from './Menu'
import { Metadata } from './Metadata'
import { Splash } from './Splash'

export function ContentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-3xl m-auto p-3">
      <Metadata />
      <Menu />
      <Splash />
      {children}
    </div>
  )
}
