import { frontmatterIcons, type IconProps } from './icons'
import { requestInfo as r } from 'rwsdk/worker'
import type { Navlink } from '../contentSource/types'

export const Menu = () => {
  const siteData = r.ctx.pageContext.siteData
  if (!siteData) return null
  return (
    <nav className="flex flex-wrap mb-4">
      {siteData?.navlinks?.map((link, index) => (
        <MenuLink key={index} link={link} />
      ))}
      <span className="flex-grow"></span>
      {siteData?.sociallinks?.map((link, index) => (
        <MenuLink key={index} link={link} />
      ))}
    </nav>
  )
}

function MenuLink({ link }: { link: Navlink }) {
  return (
    <a className="px-[6px]" href={link.href} aria-label={link.text}>
      {link.icon
        ? (frontmatterIcons[link.icon as keyof typeof frontmatterIcons] ?? frontmatterIcons['default'])({
            name: link.icon,
            className: 'h-5 hover:text-orange-500 transition-colors duration-200 ease-in-out'
          })
        : link.text}
    </a>
  )
}
