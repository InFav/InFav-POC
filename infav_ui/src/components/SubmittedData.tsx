import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    IconButton,
    Modal,
    Textarea,
    CircularProgress,
    Typography,
    Option,
    Select,
} from "@mui/joy";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import dayjs, { Dayjs } from 'dayjs';
import axios from "axios";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddPostModal from "./AddPostModal.tsx";

interface Post {
    id: string;
    Post_content: string;
    Post_date: string;
}

interface EventData {
    eventName: string;
    engagementType: string;
    description: string;
    contacts: string;
    deadlines: string;
    eventDate: string;  // Add eventDate to match the database schema
}

interface Engagement {
    event_name: string;
    engagement_type: string;
    description: string;
    contacts: string;
    deadlines: string;
    event_date: string;
}

interface EventData {
    eventName: string;
    engagementType: string;
    description: string;
    contacts: string;
    deadlines: string;
    eventDate: string;
}



interface Posts {
    [key: string]: Post;
}

const SubmittedData: React.FC = () => {
    const location = useLocation();
    const { personaId, generatedPosts } = location.state;

    const [posts, setPosts] = useState<Posts>(
        Object.entries(generatedPosts).reduce((acc, [key, value]) => {
            acc[key] = { id: key, ...value as Omit<Post, 'id'> }; // Adding id based on the key
            return acc;
        }, {} as Posts)
    );

    const [loading, setLoading] = useState(false);
    const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
    const [openModalPost, setOpenModalPost] = useState<boolean>(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [additionalText, setAdditionalText] = useState('');
    const [prompts, setPrompts] = useState<string[]>([]);
    const [copied, setCopied] = useState(false);

    const [eventData, setEventData] = useState<EventData>({
        eventName: '',
        engagementType: 'Conferences',
        description: '',
        contacts: '',
        deadlines: '',
        eventDate: ''
    });

    const [events, setEvents] = useState<{ [key: string]: EventData }>({});
    const [openModalEvent, setOpenModalEvent] = useState<boolean>(false);
    const [openModalEventDetails, setOpenModalEventDetails] = useState<boolean>(false); // Event details modal
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null); // Track selected event for details modal
    const [selectedPostDate, setSelectedPostDate] = useState<string>('');

    const idToken = localStorage.getItem('idToken');

    // Helper function to find the next available date without posts
    const findNextAvailableDate = (startDate: Date): string => {
        let nextDate = new Date(startDate);

        // Keep looping until we find a date without a post
        while (true) {
            const formattedDate = formatDateToISO(nextDate);

            // Check if any post already has this formattedDate as Post_date
            const postExistsForDate = Object.values(posts).some(post => dayjs(post.Post_date).format('YYYY-MM-DD') === formattedDate);

            // If no post exists for this date, return it as the next available date
            if (!postExistsForDate) {
                return formattedDate;
            }

            // Increment the date by 1 day
            nextDate.setDate(nextDate.getDate() + 1);
        }
    };

// Helper function to format the date as 'YYYY-MM-DD'
    const formatDateToISO = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };


    const handlePostSubmit = async (newPostDetails: any) => {
        const today = new Date();
        console.log(today)
        const nextAvailableDate = findNextAvailableDate(today);
        console.log(nextAvailableDate)
        if (nextAvailableDate) {
            const idToken = localStorage.getItem('idToken');
            try {
                // Make POST request to /add-task API
                const response = await fetch('https://infav-906977611020.us-central1.run.app/task/add-task', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${idToken}`,  // Include the Bearer token
                    },
                    body: JSON.stringify({
                        personaId: personaId,  // Pass the persona ID
                        taskName: newPostDetails.taskName,  // Pass the task name
                        taskDetails: newPostDetails.taskDetails,  // Pass the task details
                        lessonsLearnt: newPostDetails.lessonsLearnt,  // Pass the lessons learnt
                        nextAvailableDate: nextAvailableDate  // Use the next available date for the post
                    }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                // Extract the response content (task and generated post) from the response
                const result = await response.json();
                console.log("Task and Post created:", result);

                const generatedPost = result.generatedPosts[0];  // Assuming the first generated post is returned

                // Update the posts state with the new post for the available date
                setPosts(prevPosts => {
                    const keys = Object.keys(prevPosts).map(Number).filter(n => !isNaN(n));  // Ensure numeric keys only
                    const nextKey = keys.length > 0 ? Math.max(...keys) + 1 : 0;  // Find the highest key and add 1

                    const updatedPosts = {
                        ...prevPosts,
                        [nextKey]: {
                            id: nextKey,  // The post ID
                            Post_content: generatedPost.Post_content,  // The generated post content
                            Post_date: nextAvailableDate  // The date the post is assigned to
                        }
                    };

                    return updatedPosts;
                });

                console.log("Post created for date:", nextAvailableDate);
            } catch (error) {
                console.error('Error creating post:', error);
            }
        } else {
            console.error('No available date found for posting.');
        }
    };


    // Load events from localStorage when component mounts
    useEffect(() => {
        // Fetch engagements from the backend
        const fetchEngagements = async () => {
            try {
                const response = await axios.get(`https://infav-906977611020.us-central1.run.app/engagements/${personaId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ` + idToken,
                    },
                });

                // Assuming your API returns an array of engagements
                const engagements = response.data;

                console.log(engagements)



                // Convert the engagements array to an object format for `setEvents`
                const eventsMap = engagements.reduce((acc: { [key: string]: EventData }, engagement : Engagement) => {
                    const eventDate = dayjs(engagement.event_date).format("YYYY-MM-DD");
                    const mappedEvent: EventData = {
                        eventName: engagement.event_name, // Map event_name to eventName
                        engagementType: engagement.engagement_type,
                        description: engagement.description,
                        contacts: engagement.contacts,
                        deadlines: engagement.deadlines,
                        eventDate: engagement.event_date
                    };
                    console.log(mappedEvent)
                    acc[eventDate] = mappedEvent;
                    return acc;
                }, {});

                setEvents(eventsMap);  // Update the state with the events from DB

            } catch (error) {
                console.error('Error fetching engagements:', error);
            }
        };

        fetchEngagements();
    }, [personaId]);

    useEffect(() => {
        //const storedPrompts = localStorage.getItem('prompts');

        const fetchPromptsForPersona = async () => {
            const idToken = localStorage.getItem('idToken'); // Get the user token if needed for authentication
            try {
                const response = await fetch(`/prompts/${personaId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${idToken}` // Add token if required
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch prompts for persona_id: ${personaId}`);
                }

                const promptsData = await response.json();
                // Assuming the backend returns an array of { post_id, prompt_content }
                const allPrompts = promptsData.map((prompt: { prompt_content: string }) => prompt.prompt_content);

                setPrompts(allPrompts); // Update state with all the prompts

            } catch (error) {
                console.error('Error fetching prompts:', error);
            }
        };

        if (openModalPost) {
            fetchPromptsForPersona(); // Fetch prompts when the modal is opened
        }

    }, [openModalPost, personaId]);

    // Save events to localStorage
    const saveEventsToLocalStorage = async (newEvents: { [key: string]: EventData }) => {
        //localStorage.setItem('events', JSON.stringify(newEvents));

        if (selectedDate) {
            const eventData = {
                persona_id: personaId, // Assuming you have the persona ID in state
                event_name: newEvents[selectedDate].eventName,
                engagement_type: newEvents[selectedDate].engagementType,
                description: newEvents[selectedDate].description,
                contacts: newEvents[selectedDate].contacts,
                deadlines: newEvents[selectedDate].deadlines,
                event_date: selectedDate, // Pass the selected date as the event date
            };

            const idToken = localStorage.getItem('idToken');

            try {
                console.log(eventData)
                const response = await fetch('https://infav-906977611020.us-central1.run.app/engagements', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ` + idToken,
                    },
                    body: JSON.stringify(eventData),
                });

                if (!response.ok) {
                    throw new Error('Failed to save event');
                }

                const savedEvent = response.json();
                console.log('Saved event:', savedEvent);

                // Optionally, update the local state or UI
            } catch (error) {
                console.error('Error saving event:', error);
            }
        }
    };

    const handleOpenModalEvent = (date: string) => {
        setSelectedDate(date);
        setOpenModalEvent(true);
    };

    const handleCloseModalEvent = () => {
        setOpenModalEvent(false);
        setEventData({
            eventName: '',
            engagementType: 'Conferences',
            description: '',
            contacts: '',
            deadlines: '',
            eventDate: ''
        });
    };

    const handleOpenModalPost = (post: Post | undefined, postDate: string) => {
        if (post) { // Add this check
            setSelectedPost(post);
            setSelectedPostDate(postDate);
            setOpenModalPost(true);
        }
    };

    const handleCloseModalPost = () => {
        setOpenModalPost(false);
        setSelectedPost(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target as HTMLInputElement;
        setEventData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSelectChange = (name: string) => (_event: React.MouseEvent | React.KeyboardEvent | React.FocusEvent | null, value: string | null) => {
        setEventData(prevData => ({
            ...prevData,
            [name]: value || '',
        }));
    };

    // Handle form submission
    const handleFormSubmit = () => {
        if (selectedDate) {
            const updatedEvents = { ...events, [selectedDate]: eventData };
            setEvents(updatedEvents);
            saveEventsToLocalStorage(updatedEvents);
            handleCloseModalEvent();
        }
    };

    const handleCopyForLinkedIn = async () => {
        if (selectedPost) {
            const postContent = selectedPost.Post_content;
            const postDate = selectedPost.Post_date;

            await fetch(`https://infav-906977611020.us-central1.run.app/posts/accept-and-copy-click`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,  // Include the Bearer token
                },
                body: JSON.stringify({ postDate, personaId }),
            });

            // Copy the content to clipboard
            navigator.clipboard.writeText(postContent).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                console.log('Copied to clipboard successfully!');
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        }
    };

    // Open event details modal
    const handleOpenEventDetails = (event: EventData) => {
        setSelectedEvent(event);
        setOpenModalEventDetails(true);
    };

    const handleCloseEventDetails = () => {
        setOpenModalEventDetails(false);
        setSelectedEvent(null);
    };

    const daysInMonth = currentDate.daysInMonth();

    const truncateText = (text: string, maxLength: number) => {
        if (text.length > maxLength) {
            return text.substring(0, maxLength) + '...';
        }
        return text;
    };

    const handleRegenerate = async (postId: string, additionalText: string, postDate: string) => {
        console.log(`Regenerate clicked for post `, postDate);
        setLoading(true);
        console.log('Additional text:', additionalText);
        const idToken = localStorage.getItem('idToken');

        const postResponse = await fetch(`https://infav-906977611020.us-central1.run.app/posts?postDate=${postDate}&personaId=${personaId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`,
            },
        });

        if (!postResponse.ok) {
            throw new Error(`Failed to fetch post for persona ${personaId} on ${postDate}`);
        }

        const postData = await postResponse.json();

        const regenerateUrl = postData.task_id
            ? `https://infav-906977611020.us-central1.run.app/task/regenerate-post-with-task`  // Endpoint for posts with tasks
            : `https://infav-906977611020.us-central1.run.app/form-ai/regenerate`;  // Regular post regeneration endpoint


        try {

            const response = await fetch(regenerateUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    id: personaId,
                    additionalText: additionalText,
                    postDate: postDate,
                    taskId: postData.task_id || null
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Call the API to increment regenerate click count
            await fetch(`https://infav-906977611020.us-central1.run.app/posts/regenerate-click`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ` + idToken,  // Include the Bearer token
                },
                body: JSON.stringify({ postDate, personaId }),
            });

            const newContent = await response.json();

            console.log(newContent, postId)
            setPosts(prevPosts => {
                // Extract the actual post content from newContent
                const postContent = newContent['0'].Post_content;  // Assuming newContent has the correct structure with Post_content

                const updatedPosts = {
                    ...prevPosts,
                    [postId]: {
                        ...prevPosts[postId],
                        Post_content: postContent, // Set the actual content, not the whole object
                    }
                };

                // Log to confirm the content being updated
                console.log("Updated post content:", postContent);
                console.log("Selected post id:", selectedPost?.id);

                if (selectedPost && selectedPost.id === postId) {
                    setSelectedPost(updatedPosts[postId]);
                }

                return updatedPosts;
            });

            console.log(posts)

            if (additionalText !== '') {
                const updatedPrompts = [...prompts, additionalText];
                //localStorage.setItem('prompts', JSON.stringify(updatedPrompts));
                setPrompts(updatedPrompts);
            }

        } catch (error) {
            console.error('Error regenerating content:', error);
        } finally {
            setAdditionalText('');
            setLoading(false); // Hide loading spinner
        }
    };


    const renderCalendar = () => {
        const calendarDays = [];
        for (let i = 1; i <= daysInMonth; i++) {
            const currentDay = currentDate.date(i).format('YYYY-MM-DD');
            const post = Object.values(posts).find(p =>
                dayjs(p.Post_date).format('YYYY-MM-DD') === currentDay
            );
            const event = events[currentDay];

            calendarDays.push(
                <Box
                    key={i}
                    sx={{
                        flexBasis: 'calc(25% - 40px)', // 25% width minus the gap
                        minWidth: '150px',
                        border: '1px solid',
                        borderColor: 'primary.main',
                        borderRadius: 2,
                        padding: 2,
                        minHeight: 150,
                        backgroundColor: post ? 'lightgrey' : 'background.paper',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: '1.25rem', // Approximate size for h6
                            fontWeight: 'bold',
                            mb: 1,
                            textAlign: 'left',
                        }}
                    >
                        {currentDate.date(i).format('D')}
                    </Typography>

                    <IconButton
                        onClick={() => handleOpenModalEvent(currentDay)}
                        sx={{
                            position: 'absolute',
                            top: 13,
                            left: Number(currentDate.date(i).format('D')) < 10 ? 25 : 35,
                        }}
                    >
                        <AddIcon />
                    </IconButton>

                    {event && (
                        <Box
                            onClick={() => handleOpenEventDetails(event)}
                            sx={{
                                mt: 1,
                                p: 1,
                                borderRadius: 4,
                                backgroundColor: '#555555',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                fontSize: '0.875rem',
                                color: 'white',
                                textAlign: 'left',
                                cursor: 'pointer',
                            }}
                        >
                            Event: {event.eventName}
                        </Box>
                    )}

                    {post ? (
                        <Typography
                            sx={{
                                fontSize: '0.875rem',
                                color: 'text.secondary',
                                cursor: 'pointer',
                            }}
                            onClick={() => handleOpenModalPost(post, currentDay)}
                        >
                            {truncateText(post.Post_content, 125)}
                        </Typography>
                    ) : (
                        <Typography />
                    )}
                </Box>
            );
        }

        return calendarDays;
    };

    const handlePrevMonth = () => {
        const newDate = currentDate.subtract(1, 'month');
        setCurrentDate(newDate);
    };

    const handleNextMonth = () => {
        const newDate = currentDate.add(1, 'month');
        setCurrentDate(newDate);
    };

    return (
        <Box sx={{ padding: 2, backgroundColor: '#fff', color: '#000' }}>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <IconButton onClick={handlePrevMonth}>
                    <ArrowBackIosIcon />
                </IconButton>
                <Typography
                    sx={{
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        width: '150px',
                        textAlign: 'center',
                    }}
                >
                    {currentDate.format('MMMM YYYY')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AddPostModal onSubmit={handlePostSubmit} />

                    <IconButton onClick={handleNextMonth} sx={{ ml: 2 }}>
                        <ArrowForwardIosIcon />
                    </IconButton>
                </Box>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
                {renderCalendar()}
            </Box>

            {/* Modal for adding events */}
            <Modal open={openModalEvent} onClose={handleCloseModalEvent}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        backgroundColor: '#fff',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        border: '2px solid #000',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: '8px',
                    }}
                >
                    <IconButton
                        onClick={handleCloseModalEvent}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                    {/*<Typography variant="h6" sx={{ mb: 2 }}>*/}
                    {/*    Add Event for {selectedDate}*/}
                    {/*</Typography>*/}

                    <FormControl sx={{ mb: 2 }}>
                        <FormLabel>Event Name</FormLabel>
                        <Textarea
                            name="eventName"
                            value={eventData.eventName}
                            onChange={handleInputChange}
                        />
                    </FormControl>

                    <FormControl sx={{ mb: 2 }}>
                        <FormLabel>Type of Engagement</FormLabel>
                        <Select
                            name="engagementType"
                            value={eventData.engagementType}
                            onChange={handleSelectChange('engagementType')}
                        >
                            <Option value="Conferences">Conferences</Option>
                            <Option value="Meet-ups">Meet-ups</Option>
                            <Option value="Twitter Content">Twitter Content</Option>
                            <Option value="Instagram Content">Instagram Content</Option>
                        </Select>
                    </FormControl>

                    <FormControl sx={{ mb: 2 }}>
                        <FormLabel>Description</FormLabel>
                        <Textarea
                            name="description"
                            value={eventData.description}
                            onChange={handleInputChange}
                        />
                    </FormControl>

                    <FormControl sx={{ mb: 2 }}>
                        <FormLabel>Contacts from Event</FormLabel>
                        <Textarea
                            name="contacts"
                            value={eventData.contacts}
                            onChange={handleInputChange}
                        />
                    </FormControl>

                    <FormControl sx={{ mb: 2 }}>
                        <FormLabel>Deadlines</FormLabel>
                        <Textarea
                            name="deadlines"
                            value={eventData.deadlines}
                            onChange={handleInputChange}
                        />
                    </FormControl>

                    <Button fullWidth onClick={handleFormSubmit}>
                        Save Event
                    </Button>
                </Box>
            </Modal>

            {/* Modal for viewing posts */}
            <Modal open={openModalPost} onClose={handleCloseModalPost}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        backgroundColor: '#fff',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        border: '2px solid #000',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: '8px',
                    }}
                >
                    <IconButton
                        onClick={handleCloseModalPost}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                    {selectedPost && (
                        <>
                            <Typography sx={{ fontSize: '1rem', mb: 2, color: 'text.secondary' }}>
                                {selectedPost.Post_content}
                            </Typography>

                            {prompts.length > 0 && (
                                <Box sx={{ mb: 2 }}>
                                    {/*<Typography variant="h6">Previous Prompts:</Typography>*/}
                                    <Box>
                                        {prompts.map((prompt, index) => (
                                            <Button
                                                key={index}
                                                onClick={() => setAdditionalText(prompt)} // Copies the prompt to the Textarea
                                                sx={{ mb: 1, textTransform: 'none' }} // Button with normal text
                                                variant="outlined"
                                            >
                                                {prompt}
                                            </Button>
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            <FormControl sx={{ mb: 2, paddingTop: 5 }}>
                                <FormLabel>Add additional details to this post</FormLabel>
                                <Textarea
                                    name="content"
                                    value={additionalText}
                                    onChange={(e) => setAdditionalText(e.target.value)}
                                    minRows={3}
                                    sx={{ mb: 2 }}
                                />
                            </FormControl>

                            {loading ? (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        height: '40px',  // Matches the height of the button
                                    }}
                                >
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <Button
                                    fullWidth
                                    onClick={() => handleRegenerate(selectedPost ? selectedPost.id : "", additionalText, selectedPostDate)}
                                    sx={{
                                        border: '2px solid',
                                        borderColor: 'primary.main',
                                        borderRadius: '16px',
                                        backgroundColor: 'primary.light',
                                        color: 'white',  // Explicitly set text color to white
                                        padding: '8px 16px',  // Padding for a contained-like button
                                        '&:hover': {
                                            backgroundColor: 'primary.main',
                                            borderColor: 'primary.dark',
                                        },
                                    }}
                                >
                                    Regenerate Post
                                </Button>
                            )}

                           <Button
                                    fullWidth
                                    onClick={() => handleCopyForLinkedIn()}
                                    sx={{
                                        border: '2px solid',
                                        borderColor: 'primary.main',
                                        borderRadius: '16px',
                                        backgroundColor: copied ? 'success.main' : 'primary.light',
                                        color: 'white',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        padding: '8px 16px',
                                        marginTop: 3,
                                        '&:hover': {
                                            backgroundColor: copied ? 'success.dark' : 'primary.main',
                                            borderColor: copied ? 'success.main' : 'primary.dark',
                                        },
                                    }}
                                >
                                    {copied ? (
                                        <>
                                            <CheckCircleIcon sx={{ marginRight: 1 }} />
                                            Copied!
                                        </>
                                    ) : (
                                        'Accept and Copy for LinkedIn'
                                    )}
                                </Button>
                        </>
                    )}
                </Box>
            </Modal>

            {/* Modal for event details */}
            <Modal open={openModalEventDetails} onClose={handleCloseEventDetails}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        backgroundColor: '#fff',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        border: '2px solid #000',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: '8px',
                    }}
                >
                    <IconButton
                        onClick={handleCloseEventDetails}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right:8
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                    {selectedEvent && (
                        <>
                            <Typography sx={{ fontSize: '1.25rem', fontWeight: '500', mb: 2 }}>
                                <strong>{selectedEvent.eventName}</strong>
                            </Typography>
                            <Typography sx={{ mb: 2 }}>
                                <strong>Type of Engagement:</strong> {selectedEvent.engagementType}
                            </Typography>
                            <Typography sx={{ mb: 2 }}>
                                <strong>Description:</strong> {selectedEvent.description}
                            </Typography>
                            <Typography sx={{ mb: 2 }}>
                                <strong>Contacts:</strong> {selectedEvent.contacts}
                            </Typography>
                            <Typography sx={{ mb: 2 }}>
                                <strong>Deadlines:</strong> {selectedEvent.deadlines}
                            </Typography>
                        </>
                    )}
                </Box>
            </Modal>
        </Box>
    );
};

export default SubmittedData;
