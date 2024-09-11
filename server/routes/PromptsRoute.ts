import {pool} from "../db/psql";
import {Router} from "express";



const router = Router();

router.post('/', async (req, res) => {
    const { postId, promptContent } = req.body;

    if (!postId || !promptContent) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO prompts (post_id, prompt_content) VALUES ($1, $2) RETURNING *',
            [postId, promptContent]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error saving prompt:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Example API route to get prompts for a specific post
router.get('/:postId', async (req, res) => {
    const { postId } = req.params;

    try {
        const result = await pool.query('SELECT * FROM prompts WHERE post_id = $1', [postId]);
        res.status(200).json(result.rows);  // Sends all prompts associated with the postId
    } catch (error) {
        console.error('Error fetching prompts:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/:persona_id', async (req, res) => {
    const { persona_id } = req.params;

    try {
        // First, get all post_ids for the given persona_id
        const postResult = await pool.query(
            `SELECT id FROM posts WHERE persona_id = $1`,
            [persona_id]
        );

        const postIds = postResult.rows.map(row => row.id);

        if (postIds.length === 0) {
            return res.status(404).json({ message: 'No posts found for this persona' });
        }

        // Now fetch all the prompts for the post_ids
        const promptResult = await pool.query(
            `SELECT post_id, prompt_content FROM prompts WHERE post_id = ANY($1::int[])`,
            [postIds]
        );

        res.status(200).json(promptResult.rows);
    } catch (error) {
        console.error('Error fetching prompts:', error);
        res.status(500).json({ error: 'An error occurred while fetching prompts.' });
    }
});


