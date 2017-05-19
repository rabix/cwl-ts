export interface Issue {
    type: "warning" | "error" | "info"
    message: string
    loc?: string
}
