import { requestInfo as r } from 'rwsdk/worker'

export const Splash = () => {
  const pageData = r.ctx.pageContext.pageData

  const splashimage = pageData?.attrs.splash?.image ?? pageData?.attrs.splashimage
  if (!splashimage) return null
  return (
    <img
      id="splashimage"
      src={splashimage}
      className="h-[10.5rem] w-full my-6 object-cover cursor-default"
      alt="splash image"
    />
  )
}
