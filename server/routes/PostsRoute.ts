import { Router } from "express";
import { Posts } from "../../types/Posts";
import { pool } from "../db/psql";

const router = Router();

router.post('/', async (req, res) => {
    const { personaId, postContent, postDate } = req.body;

    if (!personaId || !postContent || !postDate) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO posts (persona_id, post_content, post_date) VALUES ($1, $2, $3) RETURNING *',
            [personaId, postContent, postDate]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error saving post:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { postContent } = req.body;

    if (!postContent) {
        return res.status(400).json({ message: 'Missing post content' });
    }

    try {
        const result = await pool.query(
            'UPDATE posts SET post_content = $1 WHERE id = $2 RETURNING *',
            [postContent, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Example API route to get posts by persona_id
router.get('/:personaId', async (req, res) => {
    const { personaId } = req.params;

    try {
        const result = await pool.query('SELECT * FROM posts WHERE persona_id = $1', [personaId]);
        res.status(200).json(result.rows);  // Sends back all posts associated with personaId
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/regenerate-click', async (req, res) => {
    const { postDate, personaId } = req.body;  // Extract post_date and persona_id from the request

    try {
        // Increment the regenerate click count for the post using post_date and persona_id
        const result = await pool.query(
            'UPDATE posts SET regenerate_click_count = regenerate_click_count + 1 WHERE post_date = $1 AND persona_id = $2',
            [postDate, personaId]
        );

        if (result.rowCount === 0) {
            return res.status(404).send({ error: 'Post not found' });
        }

        res.status(200).send({ message: 'Regenerate click count updated successfully' });
    } catch (error) {
        res.status(500).send({ error: 'Failed to update regenerate click count' });
    }
});


router.post('/accept-and-copy-click', async (req, res) => {
    const { postDate, personaId } = req.body;  // Extract post_date and persona_id from the request

    try {
        // Increment the accept and copy click count for the post using post_date and persona_id
        const result = await pool.query(
            'UPDATE posts SET accept_and_copy_click_count = accept_and_copy_click_count + 1 WHERE post_date = $1 AND persona_id = $2',
            [postDate, personaId]
        );

        if (result.rowCount === 0) {
            return res.status(404).send({ error: 'Post not found' });
        }

        res.status(200).send({ message: 'Accept and copy click count updated successfully' });
    } catch (error) {
        res.status(500).send({ error: 'Failed to update accept and copy click count' });
    }
});


// Fetch post by post_date and persona_id
router.get('/', async (req, res) => {
    const { postDate, personaId } = req.query;

    console.log(postDate, personaId)

    try {
        const query = `
            SELECT * FROM posts 
            WHERE to_char(post_date, 'YYYY-MM-DD') = $1 AND persona_id = $2;
        `;
        const result = await pool.query(query, [postDate, personaId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.status(200).json(result.rows[0]);  // Return the post details
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ error: 'Error fetching post' });
    }
});










export { router as PostsRouter };
