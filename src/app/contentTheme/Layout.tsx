import { Menu } from './Menu'
import { Splash } from './Splash'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="prose max-w-3xl m-auto p-3">
      <Menu />
      <Splash />
      {children}
    </div>
  )
}
