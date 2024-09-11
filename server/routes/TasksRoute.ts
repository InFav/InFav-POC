import express from "express";
import {pool} from "../db/psql";
import {calculateDate, createPostsJSON, extractJSON} from "../utils/helpers";
import {GoogleGenerativeAI} from "@google/generative-ai";

const router = express.Router();
const apiKey = 'AIzaSyCLi5cEqyrVj6H7Z6wVU2EuaRJMuU7B2p0';
const generativeAIClient = new GoogleGenerativeAI(apiKey);

type Post = {
    Post_content: string;
};

type GeneratedPosts = {
    [key: string]: Post;
};
router.post('/add-task', async (req, res) => {
    const { personaId, taskName, taskDetails, lessonsLearnt, nextAvailableDate} = req.body;

    try {
            const queryText = `
                INSERT INTO tasks (task_name, task_details, lessons_learnt, assigned_date)
                VALUES ($1, $2, $3, $4)
                RETURNING *;
            `;
            const values = [taskName, taskDetails, lessonsLearnt, nextAvailableDate];

            const result = await pool.query(queryText, values);
            const task = result.rows[0];  // Returning the saved task

            console.log(task)

            const fetchResult = await pool.query('SELECT * FROM persona_input WHERE id = $1', [personaId]);

            if (fetchResult.rows.length === 0) {
                return res.status(404).json({ error: 'Persona not found' });
            }

            const formData = fetchResult.rows[0];

            console.log(formData)

        const promptForAnalysis = `
             You are an expert linguistic analyst specializing in LinkedIn content and influencer marketing. Your task is to analyze sample posts from LinkedIn influencers, including both personal and sponsored content, and extract a comprehensive description of their writing style, tone, and voice. Use the provided text examples:
            ${formData.favorite_posts} to create a detailed analysis of each influencer's unique writing style, outputting the results in a consistent JSON format.
            For each influencer's content, analyze all posts, then, generate a JSON object with the following structure:
            {
            “keyCharacteristics”: [“[List of 5-7 key characteristics]”],
            “writingTone”: [“[List of 5-7 keywords to describe writing tone including linguistic tone, grammar, punctuation, etc.]”],
            “sentenceStructure”: [“[List of 2-3 sentence structure descriptors]”],
            "literaryDevices": ["[List of 2-3 commonly used literary devices]"],
            "uniqueElements": {
            "recurringPhrases": ["[List of 2-3 recurring phrases or expressions]"], 
            "hashtagUsage": ["[List of 2-3 commonly used hashtags or hashtag styles]"], 
            "linguisticPatterns": ["[List of 2-3 unique linguistic patterns]"] 
            }, 
            "styleTips": ["[List of 3-5 writing tips to emulate this influencer's style]"],
            }
            Please analyze the following LinkedIn post examples for ${formData.name} and provide your detailed breakdown in the JSON format specified above.
        `;

        const generationConfig = {
            temperature: 1,
            topP: 0.95,
            topK: 64,
            maxOutputTokens: 8192,
            responseMimeType: 'text/plain',
        };

        const generativeModel = generativeAIClient.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig,
        });

        const aiRequestParts = [{ text: promptForAnalysis }];
        const aiResponse = await generativeModel.generateContent(aiRequestParts);

        // Check if AI response has candidates
        if (aiResponse.response.candidates) {
            const aiGeneratedText = aiResponse.response.candidates[0].content.parts[0].text;
            const cleanedJsonString = typeof aiGeneratedText === "string" ? aiGeneratedText.replace(/```json|```/g, "").trim() : "";
            console.log("cleaned json string", cleanedJsonString);
            const analysisResult = extractJSON(cleanedJsonString);

            if (analysisResult && typeof analysisResult === 'object' && 'writingTone' in analysisResult) {
                const { writingTone } = analysisResult as { writingTone: string[] };
                // Prepare the second prompt for generating LinkedIn posts
                // The content of the posts should be to talk about [[strategy_content]].
                // and it should emulate certain aspects of the target writing style [[target_writing_style]]
                const postGenerationPrompt = `
                You are a LinkedIn influencer who understands the platform, how to create posts to attract quality viewers of the target community. You help users create posts for their branding and marketing goals. User has completed an activity towards their marketing goals and wants to talk about it on social media. Your task is to create a post for the user which talks about the activity they completed and engages their audience to interact with the post.
                The following is some information on the user, their goals, the activity they have completed and the details for the activity.
                User background: User is working at "${formData.current_work}" as a "${formData.profession}". Their professional story is "${formData.journey}".
                Activity Information: The user has completed "${taskName}". To complete the activity they did following "${taskDetails}". In their own words, their experience including what they learnt, who they interacted with, etc. is "${lessonsLearnt}".
                Tone of the post: The user typically writes in a "${writingTone}" tone.
                
                You have to follow the following instructions when creating a post for the user to talk about their activity and influence their audience:
                1. Make sure the post is targetting ${formData.target_type} as target audience.
                2. Make sure you follow the tone of the user.
                3. Make sure the content of the post ONLY INCLUDES the information provided by the user.

                Your output should be in JSON format. Follow the following format:

                {"0": {
                    "Post_content": Content of Post,
                    }
                }
                
                OUTPUT JSON:
                `;

                const postGenerationRequestParts = [{ text: postGenerationPrompt }];
                const postGenerationResponse = await generativeModel.generateContent(postGenerationRequestParts);

                if (postGenerationResponse.response.candidates) {
                    const generatedPostsText = postGenerationResponse.response.candidates[0].content.parts[0].text;
                    const cleanedPostJsonString = typeof generatedPostsText === "string" ? generatedPostsText.replace(/```json|```/g, "").trim() : "";
                    console.log("cleanedPostJsonString : ", cleanedPostJsonString);
                    const generatedPosts = extractJSON(cleanedPostJsonString) as GeneratedPosts;

                    console.log("generatePosts : ", generatedPosts);

                    if (generatedPosts && typeof generatedPosts === 'object') {
                        // Iterate over the keys of the object
                        for (const key in generatedPosts) {
                            if (generatedPosts.hasOwnProperty(key)) {
                                const post = generatedPosts[key]; // Get each post object

                                console.log(nextAvailableDate)
                                // Ensure the post has the expected properties
                                if (post.Post_content) {
                                    await pool.query(
                                        `INSERT INTO posts (persona_id, post_content, post_date, task_id)
                                         VALUES ($1, $2, $3, $4)`,
                                        [personaId, post.Post_content, nextAvailableDate, task.task_id]  // Assuming 'post.content' contains the actual post text
                                    );
                                    res.status(200).json({ personaId, generatedPosts });
                                } else {
                                    console.error('post content or post date do not exist')
                                }
                            } else {
                                console.error('generated post does not have key')
                            }
                        }
                    } else {
                        console.error('Generated posts are not in an object format or are null.');
                    }


                } else {
                    res.status(500).json({
                        error: 'Post generation failed. No candidates were returned from the AI model.',
                    });
                }
            } else {
                res.status(500).json({
                    error: 'Analysis result did not include "writingTone".',
                });
            }
        } else {
            res.status(500).json({
                error: 'Analysis failed. No candidates were returned from the AI model.',
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate post' });
    }
});

router.post('/regenerate-post-with-task', async (req, res) => {
    const { id, additionalText, postDate, taskId } = req.body;

    try {

        const taskQuery = `
            SELECT task_name, task_details, lessons_learnt
            FROM tasks
            WHERE task_id = $1;
        `;
        const taskResult = await pool.query(taskQuery, [taskId]);
        const task = taskResult.rows[0];

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const { task_name, task_details, lessons_learnt } = task;
        // Fetch form data from the database using the persona ID
        const fetchResult = await pool.query('SELECT * FROM persona_input WHERE id = $1', [id]);

        if (fetchResult.rows.length === 0) {
            return res.status(404).json({ error: 'Persona not found' });
        }

        const personaData = fetchResult.rows[0];

        console.log(personaData)

        // Prepare the AI prompt for regenerating content
        const regenerationPrompt = `
             You are an expert linguistic analyst specializing in LinkedIn content and influencer marketing. Your task is to analyze sample posts from LinkedIn influencers, including both personal and sponsored content, and extract a comprehensive description of their writing style, tone, and voice. Use the provided text examples:
            ${personaData.favorite_posts} to create a detailed analysis of each influencer's unique writing style, outputting the results in a consistent JSON format.
            For each influencer's content, analyze all posts, then, generate a JSON object with the following structure:
            {
            “keyCharacteristics”: [“[List of 5-7 key characteristics]”],
            “writingTone”: [“[List of 5-7 keywords to describe writing tone including linguistic tone, grammar, punctuation, etc.]”],
            “sentenceStructure”: [“[List of 2-3 sentence structure descriptors]”],
            "literaryDevices": ["[List of 2-3 commonly used literary devices]"],
            "uniqueElements": {
            "recurringPhrases": ["[List of 2-3 recurring phrases or expressions]"], 
            "hashtagUsage": ["[List of 2-3 commonly used hashtags or hashtag styles]"], 
            "linguisticPatterns": ["[List of 2-3 unique linguistic patterns]"] 
            }, 
            "styleTips": ["[List of 3-5 writing tips to emulate this influencer's style]"],
            }
            Please analyze the following LinkedIn post examples for ${personaData.name} and provide your detailed breakdown in the JSON format specified above.
        `;

        const aiRequestParts = [{ text: regenerationPrompt }];
        const aiResponse = await generativeAIClient.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                temperature: 1,
                topP: 0.95,
                topK: 64,
                maxOutputTokens: 8192,
                responseMimeType: 'text/plain',
            }
        }).generateContent(aiRequestParts);



        if (aiResponse.response.candidates) {
            const aiGeneratedText = aiResponse.response.candidates[0].content.parts[0].text;
            const cleanedJsonString = typeof aiGeneratedText === "string" ? aiGeneratedText.replace(/```json|```/g, "").trim() : "";
            const analysisResult = extractJSON(cleanedJsonString);

            if (analysisResult && typeof analysisResult === 'object' && 'writingTone' in analysisResult) {
                const { writingTone } = analysisResult as { writingTone: string[] };

                const campaignEndDate = calculateDate(personaData.timeline);
                const today = new Date();

                // Prepare the second prompt for regenerating the post
                const postRegenerationPrompt = `
                You are a LinkedIn influencer who understands the platform, how to create posts to attract quality viewers of the target community. You help users create posts for their branding and marketing goals. User has completed an activity towards their marketing goals and wants to talk about it on social media. Your task is to create a post for the user which talks about the activity they completed and engages their audience to interact with the post.
                The following is some information on the user, their goals, the activity they have completed and the details for the activity.
                User background: User is working at "${personaData.current_work}" as a "${personaData.profession}". Their professional story is "${personaData.journey}".
                Activity Information: The user has completed "${task_name}". To complete the activity they did following "${task_details}". In their own words, their experience including what they learnt, who they interacted with, etc. is "${lessons_learnt}".
                Tone of the post: The user typically writes in a "${writingTone}" tone.
                
                You have to follow the following instructions when creating a post for the user to talk about their activity and influence their audience:
                1. Make sure the post is targeting ${personaData.target_type} as target audience.
                2. Make sure you follow the tone of the user.
                3. Make sure the content of the post ONLY INCLUDES the information provided by the user.

                Your output should be in JSON format. Follow the following format:

                {"0": {
                    "Post_content": Content of Post,
                    }
                }
                
                OUTPUT JSON:
                `;

                const postRegenerationRequestParts = [{ text: postRegenerationPrompt }];
                const postRegenerationResponse = await generativeAIClient.getGenerativeModel({
                    model: 'gemini-1.5-flash',
                    generationConfig: {
                        temperature: 1,
                        topP: 0.95,
                        topK: 64,
                        maxOutputTokens: 8192,
                        responseMimeType: 'text/plain',
                    }
                }).generateContent(postRegenerationRequestParts);

                if (postRegenerationResponse.response.candidates) {
                    const generatedPostText = postRegenerationResponse.response.candidates[0].content.parts[0].text;
                    const cleanedPostJsonString = typeof generatedPostText === "string" ? generatedPostText.replace(/```json|```/g, "").trim() : "";
                    const regeneratedPost = extractJSON(cleanedPostJsonString) as GeneratedPosts;

                    if (regeneratedPost && typeof regeneratedPost === 'object') {
                        // Iterate over the keys of the object
                        for (const key in regeneratedPost) {
                            if (regeneratedPost.hasOwnProperty(key)) {
                                const post = regeneratedPost[key]; // Get each post object

                                // Ensure the post has the expected properties
                                if (post.Post_content) {
                                    console.log(id, post, postDate)
                                    const result = await pool.query(
                                        `UPDATE posts
                                         SET post_content = $2
                                         WHERE persona_id = $1
                                           AND to_char(post_date, 'YYYY-MM-DD') = $3`,  // Ensure date matching
                                        [id, post.Post_content, postDate]  // Ensure postDate is passed in the right format
                                    );

                                    if (result.rowCount === 0) {
                                        return res.status(404).json({error: 'No post found for the given persona and date.'});
                                    }


                                    if(additionalText && additionalText.trim() !== "") {

                                        // Step 2: Fetch the updated post ID for the prompt creation
                                        const postResult = await pool.query(
                                            `SELECT id
                                         FROM posts
                                         WHERE persona_id = $1
                                           AND to_char(post_date, 'YYYY-MM-DD') = $2`,
                                            [id, postDate]
                                        );

                                        if (postResult.rows.length === 0) {
                                            return res.status(404).json({error: 'Post not found for prompt creation.'});
                                        }

                                        const postId = postResult.rows[0].id;


                                        // Step 3: Insert the prompt into the database
                                        await pool.query(
                                            `INSERT INTO prompts (post_id, prompt_content)
                                             VALUES ($1, $2)`,
                                            [postId, additionalText]  // Save "additionalText" as the prompt content
                                        );

                                    }
                                }
                            }
                        }
                    } else {
                        console.error('Failed to parse regenerated post.');
                    }

                    res.status(200).json(regeneratedPost);
                } else {
                    res.status(500).json({
                        error: 'Post regeneration failed. No candidates were returned from the AI model.',
                    });
                }
            } else {
                res.status(500).json({
                    error: 'Analysis result did not include "writingTone".',
                });
            }
        } else {
            res.status(500).json({
                error: 'Analysis failed. No candidates were returned from the AI model.',
            });
        }
    } catch (error) {
        console.error('Error regenerating content:', error);
        res.status(500).json({ error: 'An error occurred during content regeneration.' });
    }
});


export { router as TasksRouter };
