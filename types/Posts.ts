export type Posts = {
    id: number;            // Primary key of the post
    persona_id: number;    // Foreign key referencing the persona
    post_content: string;  // The content of the post
    post_date: string;     // Date the post was created or scheduled
    regenerate_click_count: number; // Count for regenerate button clicks
    accept_and_copy_click_count: number;
};
