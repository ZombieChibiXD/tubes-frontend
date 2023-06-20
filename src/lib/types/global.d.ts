interface NewAccessToken {
    accessToken: {
        name: string;
        abilities: string[];
        expires_at: string;
        tokenable_id: number;
        tokenable_type: string;
        updated_at: string;
        created_at: string;
        id: number;
    },
    plainTextToken: string;
}

export {
    NewAccessToken
}