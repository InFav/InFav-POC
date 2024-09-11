import { addWeeks, addMonths } from 'date-fns';

export function calculateDate(input: string): Date {
    const [number, timeline] = input.split(' ');

    const today = new Date();
    const parsedNumber = parseInt(number, 10);

    if (isNaN(parsedNumber)) {
        throw new Error('Invalid number. Please enter a valid number of weeks or months.');
    }

    if (timeline === 'weeks' || timeline === 'week') {
        return addWeeks(today, parsedNumber);
    } else if (timeline === 'months' || timeline === 'month') {
        return addMonths(today, parsedNumber);
    } else {
        throw new Error('Invalid timeline. Please specify "weeks" or "months".');
    }
}

export function extractJSON(str: string): object | null {
    const jsonStart = str.indexOf('{');
    const jsonEnd = str.lastIndexOf('}') + 1;

    if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("No JSON content found");
    }

    const jsonString = str.slice(jsonStart, jsonEnd);

    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Failed to parse JSON:", error);
        return null;
    }
}

export const createPostsJSON = (numberOfPosts: number): string => {
    const posts: { [key: number]: { Post_content: string; Post_date: string } } = {};

    for (let i = 0; i < numberOfPosts; i++) {
        posts[i] = {
            "Post_content": `[Content of LinkedIn Post ${i}]`,
            "Post_date": "[YYYY-MM-DD HH:mm:ss]"
        };
    }

    return JSON.stringify(posts, null, 2);
};
