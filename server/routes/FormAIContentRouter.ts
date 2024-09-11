import { Router } from "express";
import { pool } from "../db/psql"; // Import the pool instance
import { GoogleGenerativeAI } from "@google/generative-ai";
import { calculateDate, extractJSON, createPostsJSON } from "../utils/helpers"; // Assume you move utility functions to helpers file

const router = Router();
const apiKey = 'AIzaSyCLi5cEqyrVj6H7Z6wVU2EuaRJMuU7B2p0';
const generativeAIClient = new GoogleGenerativeAI(apiKey);

type Post = {
    Post_content: string;
    Post_date: string;
};

type GeneratedPosts = {
    [key: string]: Post;
};

/**
 * Handle form submissions
 */
router.post('/submit-form', async (req, res) => {
    const formData = req.body;
    console.log('Received form data:', formData);
    console.log(formData.userId)

    // Extract filenames from the analytics files array, if present
    const analyticsFileNames = Array.isArray(formData.analyticsFiles)
        ? formData.analyticsFiles.map((file: File) => file.name)
        : [];

    try {
        // Insert form data into the persona_input table
        const insertResult = await pool.query(
            `INSERT INTO persona_input (user_id, name, profession, current_work, goal, journey, company_size, industry_target, linked_profiles, target_type, favorite_posts, best_posts, posts_to_create, post_purpose, inspiring_companies, timeline, analytics_files)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING id`,
            [
                formData.userId,
                formData.name,
                formData.profession,
                formData.currentWork,
                formData.goal,
                formData.journey,
                formData.companySize,
                formData.industryTarget,
                formData.linkedProfiles,
                formData.targetType,
                formData.favoritePosts,
                formData.bestPosts,
                formData.postsToCreate,
                formData.postPurpose,
                formData.inspiringCompanies,
                formData.timeline,
                analyticsFileNames,
            ]
        );

        const personaId = insertResult.rows[0].id;

        // Prepare the first AI prompt based on form data
        const promptForAnalysis = `
             You are an expert linguistic analyst specializing in LinkedIn content and influencer marketing. Your task is to analyze sample posts from LinkedIn influencers, including both personal and sponsored content, and extract a comprehensive description of their writing style, tone, and voice. Use the provided text examples:
            ${formData.favoritePosts} to create a detailed analysis of each influencer's unique writing style, outputting the results in a consistent JSON format.
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

                const campaignEndDate = calculateDate(formData.timeline);


                const today = new Date();
                // Prepare the second prompt for generating LinkedIn posts
                // The content of the posts should be to talk about [[strategy_content]].
                // and it should emulate certain aspects of the target writing style [[target_writing_style]]
                const postGenerationPrompt = `
                You are an expert linguistic analyst specializing in LinkedIn content and influencer marketing. 
                Your task is to create ${formData.postsToCreate} posts targetted at ${formData.targetType}. 
                Your main influence goal is ${formData.goal}, and the purpose for your post is ${formData.postPurpose}. 
               
                Your task is to devise a strategy that creates a series of posts to keep the ${formData.targetType} interested and engaged. 
                The posts that you create should have a ${writingTone} for the user. 
                The start date of the campaign is ${today} and the end date of the campaign is ${campaignEndDate}. 
                Your task is to generate a JSON that can provide with a strategy and a timeline. 
                Focus on the writing style, the content and create a strategy timeline for posts.
                    ${createPostsJSON(formData.postsToCreate)}
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

                                // Ensure the post has the expected properties
                                if (post.Post_content && post.Post_date) {
                                    await pool.query(
                                        `INSERT INTO posts (persona_id, post_content, post_date)
                                         VALUES ($1, $2, $3)`,
                                        [personaId, post.Post_content, post.Post_date]  // Assuming 'post.content' contains the actual post text
                                    );
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

                    res.status(200).json({ personaId, generatedPosts });
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
        console.error('Error processing form submission:', error);
        res.status(500).json({ error: 'An error occurred during form submission.' });
    }
});

/**
 * Handle regeneration of content based on persona ID
 */
router.post('/regenerate', async (req, res) => {
    console.log('I have entered')
    const { id, additionalText, postDate } = req.body;

    try {
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
                You are an expert linguistic analyst specializing in LinkedIn content and influencer marketing. 
                Your task is to create 1 posts targetted at ${personaData.targetType}. 
                Your main influence goal is ${personaData.goal}, and the purpose for your post is ${personaData.postPurpose}. 
               
                Your task is to devise a strategy that creates a series of posts to keep the ${personaData.targetType} interested and engaged. 
                The posts that you create should have a ${writingTone} for the user. 
                The start date of the campaign is ${today} and the end date of the campaign is ${campaignEndDate}. 
                Your task is to generate a JSON that can provide with a strategy and a timeline. 
                Focus on the writing style, the content and create a strategy timeline for posts.
                    ${createPostsJSON(1)} ${additionalText}
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
                                if (post.Post_content && post.Post_date) {
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

export { router as FormAIContentRouter };
