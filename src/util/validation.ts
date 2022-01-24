const emailRegex = /\S+@\S+\.\S+/
const passwordRegex = /((?=.*\d)(?=.*[a-z]).{6,20})/

export default class Validation {
    public static email(email: string): boolean {
        return !!email.match(emailRegex)
    }

    public static password(password: string): boolean {
        return !!password.match(passwordRegex)
    }
}
