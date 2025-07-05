import { requestInfo as r } from 'rwsdk/worker'

export function Metadata() {
  const pageData = r.ctx.pageContext?.pageData
  const siteData = r.ctx.pageContext?.siteData
  const title = pageData?.attrs.title || siteData?.title || 'jldec.me'
  const description = pageData?.attrs.description || title || 'Homepage'
  const siteurl = siteData?.siteurl
  const path = pageData?.path
  const url = (siteurl ?? '') + (path ?? '/')
  const splashimage = pageData?.attrs.splash?.image ?? pageData?.attrs.splashimage
  const image = pageData?.attrs.image ?? splashimage
  const siteimage = siteurl && image ? '' + new URL(image, url) : ''
  const twitter = siteData?.twitter

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:description" content={description} />
      <meta property="og:title" content={title} />
      {siteurl ? (
        <>
          <link rel="canonical" href={url} />
          <meta property="og:url" content={url} />
        </>
      ) : null}
      {siteimage ? (
        <>
          <meta property="og:image" content={siteimage} />
          <meta name="twitter:card" content="summary_large_image" />
        </>
      ) : null}
      {twitter ? (
        <>
          <meta name="twitter:site" content={twitter} />
          <meta name="twitter:creator" content={twitter} />
        </>
      ) : null}
    </>
  )
}
