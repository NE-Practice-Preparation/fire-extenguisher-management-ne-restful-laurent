import { prisma, UserRole } from "../client"

async function main() {
  const email = process.env.SEED_ROLE1_EMAIL

  if (!email) {
    console.log("No seed data configured. Set SEED_ROLE1_EMAIL to create a role 1 user later.")
    return
  }

  const existing = await prisma.user.findUnique({
    where: { email },
  })

  if (existing) {
    console.log(`Seed role 1 user already exists: ${email}`)
    return
  }

  console.log(
    "SEED_ROLE1_EMAIL is set, but password seeding is intentionally skipped until auth hashing is configured."
  )
  console.log(`Create ${email} through the signup API or add a hashed seed flow later.`)
  console.log(`Default role 1 value available: ${UserRole.ROLE1}`)
}

void main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
