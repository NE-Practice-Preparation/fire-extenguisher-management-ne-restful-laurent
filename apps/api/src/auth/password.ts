import { randomBytes, scrypt, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"

const scryptAsync = promisify(scrypt)

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex")
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer

  return `${salt}:${derivedKey.toString("hex")}`
}

export async function verifyPassword(password: string, passwordHash: string) {
  const [salt, key] = passwordHash.split(":")

  if (!salt || !key) {
    return false
  }

  const hashedBuffer = Buffer.from(key, "hex")
  const suppliedBuffer = (await scryptAsync(password, salt, 64)) as Buffer

  return (
    hashedBuffer.length === suppliedBuffer.length &&
    timingSafeEqual(hashedBuffer, suppliedBuffer)
  )
}
