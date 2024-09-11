import { Router } from "express";
import { pool } from "../db/psql"; // Import the pool instance
const router = Router();

/**
 * Get all personas
 */
router.get("/", async (req, res, next) => {
    try {
        const personas = await pool.query('SELECT * FROM persona_input');
        res.status(200).json(personas.rows);
    } catch (err) {
        next(err); // Passes the error to the error handling middleware
    }
});

/**
 * Get persona by id
 */
router.get("/:id", async (req, res, next) => {
    const { id } = req.params;

    try {
        const persona = await pool.query('SELECT * FROM persona_input WHERE id = $1', [id]);
        if (persona.rows.length === 0) {
            return res.status(404).json({ error: 'Persona not found' });
        }
        res.status(200).json(persona.rows[0]);
    } catch (err) {
        next(err); // Passes the error to the error handling middleware
    }
});

/**
 * Create a persona
 */
router.post("/", async (req, res, next) => {
    const { user_id, professional_identity, focus_area, story, business_story, target_audience, persona_data } = req.body;

    try {
        const newPersona = await pool.query(
            `INSERT INTO persona_input (user_id, professional_identity, focus_area, story, business_story, target_audience, persona_data)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [user_id, professional_identity, focus_area, story, business_story, target_audience, persona_data]
        );
        res.status(201).json(newPersona.rows[0]);
    } catch (err) {
        next(err); // Passes the error to the error handling middleware
    }
});

/**
 * Update persona by id
 */
router.patch("/:id", async (req, res, next) => {
    const { id } = req.params;
    const { professional_identity, focus_area, story, business_story, target_audience, persona_data } = req.body;

    try {
        const updatedPersona = await pool.query(
            `UPDATE persona_input
             SET professional_identity = $1, focus_area = $2, story = $3, business_story = $4, target_audience = $5, persona_data = $6
             WHERE id = $7
             RETURNING *`,
            [professional_identity, focus_area, story, business_story, target_audience, persona_data, id]
        );
        if (updatedPersona.rows.length === 0) {
            return res.status(404).json({ error: 'Persona not found' });
        }
        res.status(200).json(updatedPersona.rows[0]);
    } catch (err) {
        next(err); // Passes the error to the error handling middleware
    }
});

/**
 * Delete persona by id
 */
router.delete("/:id", async (req, res, next) => {
    const { id } = req.params;

    try {
        const deleteResult = await pool.query('DELETE FROM persona_input WHERE id = $1 RETURNING *', [id]);
        if (deleteResult.rows.length === 0) {
            return res.status(404).json({ error: 'Persona not found' });
        }
        res.status(200).json({ message: 'Persona deleted successfully' });
    } catch (err) {
        next(err); // Passes the error to the error handling middleware
    }
});

export { router as PersonaRouter };
