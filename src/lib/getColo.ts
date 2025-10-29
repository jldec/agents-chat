type Colo = Record<string, string | number>

/**
 * Get colo info of nearby worker
 */
export async function getColo() {
  const coloWorker = 'https://getcolo.jldec.me'
  const start = Date.now()
  const resp = await fetch(coloWorker)
  const colo: Colo = resp.ok ? await resp.json() as Colo : { status: resp.status }
  colo.worker = coloWorker
  colo.workerFetchTime = Date.now() - start
  return colo
}
