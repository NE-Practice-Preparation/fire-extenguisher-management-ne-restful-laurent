import { hash } from "bcryptjs"

import { prisma, UserRole } from "../client"

/**
 * Seeds the single ADMIN account for the Fire Extinguisher Management System.
 *
 * The admin is the only account that cannot be created through public signup,
 * so it must be provisioned here. Re-running the seed is safe: it upserts and
 * never creates a second admin.
 */
async function main() {
  const email = process.env.SEED_ADMIN_EMAIL?.toLowerCase()
  const password = process.env.SEED_ADMIN_PASSWORD
  const firstName = process.env.SEED_ADMIN_FIRST_NAME ?? "System"
  const lastName = process.env.SEED_ADMIN_LAST_NAME ?? "Administrator"

  if (!email || !password) {
    console.log(
      "Skipping admin seed. Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in your .env to create the admin."
    )
    return
  }

  const existingAdmin = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN },
  })

  if (existingAdmin && existingAdmin.email !== email) {
    console.log(
      `An admin already exists (${existingAdmin.email}). Only one admin is allowed; skipping.`
    )
    return
  }

  const passwordHash = await hash(password, 10)

  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: UserRole.ADMIN, isActive: true, firstName, lastName },
    create: {
      firstName,
      lastName,
      email,
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
    },
  })

  console.log(`Admin ready: ${admin.email} (role: ${admin.role})`)
}

void main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
