// https://en.wikipedia.org/wiki/Fowler–Noll–Vo_hash_function#FNV-1a_hash
export function hash(str: string): string {
  const FNV_OFFSET_BASIS = 14695981039346656037n
  const FNV_PRIME = 1099511628211n

  let hash = FNV_OFFSET_BASIS

  for (let i = 0; i < str.length; i++) {
    hash ^= BigInt(str.charCodeAt(i))
    hash = BigInt.asUintN(64, hash * FNV_PRIME)
  }

  return hash.toString(36)
}
