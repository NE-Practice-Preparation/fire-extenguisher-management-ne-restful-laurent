import { registerDecorator, ValidationOptions } from "class-validator"

/**
 * Validates that a date string (YYYY-MM-DD or ISO) is today or later.
 * Date-only comparison using the local calendar day, so "today" passes.
 */
export function IsNotPastDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "isNotPastDate",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (typeof value !== "string") return false
          const parsed = new Date(value)
          if (Number.isNaN(parsed.getTime())) return false
          const todayStr = new Date().toLocaleDateString("en-CA") // YYYY-MM-DD (local)
          return value.slice(0, 10) >= todayStr
        },
        defaultMessage() {
          return `${propertyName} cannot be in the past`
        },
      },
    })
  }
}
