import { Router } from "express";
import { pool } from "../db/psql"; // Assuming you're using PostgreSQL

const router = Router();

router.post('/', async (req, res) => {
    console.log(req.body)
    const { persona_id, event_name, engagement_type, description, contacts, deadlines, event_date } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO engagements (persona_id, event_name, engagement_type, description, contacts, deadlines, event_date)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [persona_id, event_name, engagement_type, description, contacts, deadlines, event_date]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error saving engagement:', error);
        res.status(500).json({ error: 'Failed to save engagement' });
    }
});

// Example route in Express to fetch engagements by persona_id
router.get('/:personaId', async (req, res) => {
    const { personaId } = req.params;

    try {
        const engagements = await pool.query(
            'SELECT * FROM engagements WHERE persona_id = $1', [personaId]
        );
        res.status(200).json(engagements.rows);
    } catch (error) {
        console.error('Error fetching engagements:', error);
        res.status(500).json({ error: 'Failed to fetch engagements.' });
    }
});



export { router as EngagementRouter };
