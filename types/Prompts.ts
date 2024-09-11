export type Prompt = {
    id: number;           // Primary key of the prompt
    post_id: number;      // Foreign key referencing the post
    prompt_content: string; // The content of the prompt
};
