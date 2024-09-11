import { Pool } from 'pg';

export const pool = new Pool({
  user: 'u33khf0lcb24d3',
  host: 'ccpa7stkruda3o.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com',
  database: 'dcl55gg9emha80',
  password: 'p94c875859cc3bc720521f0ef5b4d525f179b2734e25ee3c576feb6da27043ab8',
  port: 5432, // Default port for PostgreSQL,
  ssl: {
    rejectUnauthorized: false
  }
});

