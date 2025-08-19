import { Menu } from './Menu'
import { Metadata } from './Metadata'
import { Splash } from './Splash'
import { LayoutProps } from 'rwsdk/router'

export function ContentLayout({ children }: LayoutProps) {
  return (
    <div className="max-w-3xl m-auto p-3">
      <Metadata />
      <Menu />
      <Splash />
      {children}
    </div>
  )
}
