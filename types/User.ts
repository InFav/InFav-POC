export type User = {
    id: string,
    name: string,
    email: string,
    password_hash: string,
    created_at: string, // DateTime in postgres
    updated_at: string, // DateTime in postgres
}