// TODO: DirData should be part of PageData
export type ContentPageContext = {
  pathname: string
  pageData?: PageData
  siteData?: Frontmatter
  dirData?: DirData
  [key: string]: unknown
}

export type DirData = {
  path: string
  attrs?: Frontmatter
  next?: Navlink
  prev?: Navlink
}

export type PageData = {
  path: string
  attrs: Frontmatter
  md: string
  html: string
  dir?: DirData[]
}

export interface Frontmatter {
  draft?: boolean
  layout?: string
  title?: string
  description?: string
  siteurl?: string // e.g. https://jldec.me
  icon?: string
  navlinks?: Navlink[] // main menu
  sociallinks?: Navlink[] // main menu
  actionlinks?: Navlink[] // contact sales, etc.
  features?: Navlink[]
  twitter?: string // e.g. jldec - for meta tags
  error?: unknown
  sortby?: string
  date?: string
  image?: string
  splashimage?: string
  splash?: Splash
  favicon?: string
  [key: string]: unknown
}
export interface Navlink {
  href: string
  text: string
  icon?: string
  image?: string
  details?: string
}

export interface Splash {
  image?: string
  title?: string
  subtitle?: string
}

export interface Redirect {
  redirect: string
  status?: number
}
