import React, {useEffect, useState} from 'react';
import {
    FormControl,
    FormHelperText,
    FormLabel,
    Input,
    Select,
    Option,
    Textarea,
    Button,
    Box,
    Typography,
    CircularProgress
} from '@mui/joy';
import {useLocation, useNavigate} from "react-router-dom";

const InFavForm = () => {

    const location = useLocation();
    const { userId } = location.state;
    console.log(userId)

    const navigate = useNavigate();

    const idToken = localStorage.getItem('idToken');

    const [formData, setFormData] = useState({
        userId: '',
        name: '',
        profession: '',
        currentWork: '',
        professionalCommunities: [],
        goal: '',
        journey: '',
        companySize: '',
        industryTarget: '',
        linkedProfiles: '',
        targetType: '',
        favoritePosts: '',
        bestPosts: '',
        postsToCreate: '',
        postPurpose: '',
        inspiringCompanies: '',
        timeline: '',
        analyticsFiles: [] as File[]  // Type explicitly as an array of File objects
    });

    // Use useEffect to set the userId when location.state is available
    useEffect(() => {
        if (location.state && location.state.userId) {
            setFormData(prevData => ({
                ...prevData,
                userId: location.state.userId
            }));
        }
    }, [location.state]);

    useEffect(() => {
        console.log('FormData:', formData);
    }, [formData]);


    const handleSelectChangeMultiple = (name: string) => (_event: React.MouseEvent | React.KeyboardEvent | React.FocusEvent | null, value: string[] | null) => {
        setFormData(prevData => ({
            ...prevData,
            [name]: value || [],  // If no value, default to an empty array
        }));
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event || !event.target) {
            console.error('handleChange called without a valid event:', event);
            return;
        }

        console.log('Event:', event);  // Log the entire event object
        console.log('Target:', event.target);  // Log the target element
        console.log('Value:', event.target.value);  // Log the value of the target element


        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    };

    const handleSelectChange = (name: string) => (_event: React.MouseEvent | React.KeyboardEvent | React.FocusEvent | null, value: string | null) => {
        setFormData(prevData => ({
            ...prevData,
            [name]: value || '',
        }));
    };

    const handleTextAreaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!event || !event.target) {
            console.error('handleChange called without a valid event:', event);
            return;
        }

        console.log('Event:', event);  // Log the entire event object
        console.log('Target:', event.target);  // Log the target element
        console.log('Value:', event.target.value);  // Log the value of the target element


        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    };
    const [loading, setLoading] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            setFormData({
                ...formData,
                analyticsFiles: [...formData.analyticsFiles, ...Array.from(files)]
            });
        }
    };


    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        setLoading(true);
        event.preventDefault();
        const formElements = new FormData(event.currentTarget);
        const formJson = Object.fromEntries(formElements.entries());


        formJson.userId = formData.userId;

        // Include file names in the JSON
        //   formJson.analyticsFiles = formData.analyticsFiles.map(file => file.name);

        console.log(formJson);
        console.log("id token ", idToken)

        try {
            const response = await fetch('https://infav-906977611020.us-central1.run.app/form-ai/submit-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ` + idToken,  // Include the Bearer token
                },
                body: JSON.stringify(formJson)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            navigate('/submitted', { state: data });
            console.log('Server response:', data);

            // Handle success
        } catch (error) {
            console.error('Error submitting form:', error);
            // Handle error
        } finally {
            setLoading(false);
        }

        // Here you would typically send the formJson to your server
    };

    return (
        <Box
            component="form"
            onSubmit={onSubmit}
            sx={{
                maxWidth: 600,
                mx: 'auto',
                p: 3,
                borderRadius: 'sm',
                boxShadow: 'md',
                //backgroundColor: 'background.paper',
                backgroundColor: '#fff',  // Set background to white
                color: '#000',  // Set text color to black
            }}
        >
            {loading && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        zIndex: 1000,
                    }}
                >
                    <CircularProgress />
                </Box>
            )}
            <Typography level="h2" textAlign="center" mb={2}>
                Enhance Your Professional Influence
            </Typography>

            <FormControl sx={{ mb: 2 }}>
                <FormLabel>Your Name<span style={{color: 'red'}}>*</span></FormLabel>
                <Input
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    required
                />
            </FormControl>

            <FormControl sx={{ mb: 2 }}>
                <FormLabel>What best describes your professional role?<span style={{color: 'red'}}>*</span></FormLabel>
                <Select
                    name="profession"
                    value={formData.profession}
                    onChange={handleSelectChange('profession')}
                    required
                >
                    <Option value="Startup Founder">Startup Founder</Option>
                    <Option value="Early Career Professional">Early Career Professional</Option>
                    <Option value="Mid Level Professional">Mid Level Professional</Option>
                    <Option value="Senior or Executive">Senior or Executive</Option>
                </Select>
            </FormControl>

            <FormControl sx={{ mb: 2 }}>
                <FormLabel>Where do you currently work?<span style={{color: 'red'}}>*</span></FormLabel>
                <Input
                    name="currentWork"
                    value={formData.currentWork}
                    onChange={handleChange}
                    required
                />
            </FormControl>
            <FormControl sx={{ mb: 2 }}>
                <FormLabel>What professional communities are you a part of?</FormLabel>
                <Select
                    multiple
                    name="professionalCommunities"
                    value={formData.professionalCommunities || []}
                    onChange={(event, value: string[][]) => {
                        handleSelectChangeMultiple('professionalCommunities')(event, value.flat());
                    }}
                >
                    <Option value="Lean In India">Lean In India</Option>
                    <Option value="Lean In Bay Area">Lean In Bay Area</Option>
                    <Option value="APM Club">APM Club</Option>
                    <Option value="Bay Area Small Business">Bay Area Small Business</Option>
                    <Option value="The Product Cradle">The Product Cradle</Option>
                    <Option value="Others">Others</Option>
                </Select>
            {/* Display the selected values */}
            {formData.professionalCommunities && formData.professionalCommunities.length > 0 && (
                <Typography sx={{ fontSize: '0.875rem', textAlign: 'left' }}>
                    {formData.professionalCommunities.join(', ')}
                </Typography>

            )}
            </FormControl>


            <FormControl sx={{ mb: 2 }}>
                <FormLabel>What is your main goal for building influence? <span
                    style={{color: 'red'}}>*</span></FormLabel>
                <Select
                    name="goal"
                    value={formData.goal}
                    onChange={handleSelectChange('goal')}
                    required
                >
                    <Option value="Personal Branding">Personal Branding</Option>
                    <Option value="Product Promotions">Product Promotions</Option>
                    <Option value="Specific Topic Expertise">Specific Topic Expertise</Option>
                </Select>
            </FormControl>

            <FormControl sx={{ mb: 2 }}>
                <FormLabel>Tell us about your career journey.</FormLabel>
                <Textarea
                    name="journey"
                    value={formData.journey}
                    onChange={handleTextAreaChange}
                    minRows={3}
                />
                <FormHelperText>
                    Share your career journey and how your interests have shaped your expertise. We’re eager to hear your story in detail!
                </FormHelperText>
            </FormControl>

            <FormControl sx={{ mb: 2 }}>
                <FormLabel>What size of companies are you targeting?</FormLabel>
                <Select
                    name="companySize"
                    value={formData.companySize}
                    onChange={handleSelectChange('companySize')}
                >
                    <Option value="10-50">10-50</Option>
                    <Option value="50-100">50-100</Option>
                    <Option value="100-500">100-500</Option>
                    <Option value="500-1000">500-1000</Option>
                    <Option value="1000+">1000+</Option>
                </Select>
            </FormControl>

            <FormControl sx={{ mb: 2 }}>
                <FormLabel>Which industries or sectors are you focusing on? <span
                    style={{color: 'red'}}>*</span></FormLabel>
                <Select
                    name="industryTarget"
                    value={formData.industryTarget}
                    onChange={handleSelectChange('industryTarget')}
                    required
                >
                    <Option value="Software Development">Software Development</Option>
                    <Option value="IT Services">IT Services</Option>
                    <Option value="Financial Services">Financial Services</Option>
                    <Option value="Business Consulting">Business Consulting</Option>
                </Select>
            </FormControl>

            <FormControl sx={{ mb: 2 }}>
                <FormLabel>Type of People Being Targeted <span style={{color: 'red'}}>*</span></FormLabel>
                <Select
                    name="targetType"
                    value={formData.targetType || ''}
                    onChange={handleSelectChange('targetType')}
                    required
                >
                    <Option value="Engineers">Engineers</Option>
                    <Option value="Researchers">Researchers</Option>
                    <Option value="Product Managers">Product Managers</Option>
                    <Option value="Marketers">Marketers</Option>
                    <Option value="Designers">Designers</Option>
                </Select>
            </FormControl>

            {/*<FormControl sx={{ mb: 2 }}>*/}
            {/*    <FormLabel>Paste the LinkedIn profiles of people who have influenced your career:</FormLabel>*/}
            {/*    <Textarea*/}
            {/*        name="linkedProfiles"*/}
            {/*        value={formData.linkedProfiles}*/}
            {/*        onChange={handleTextAreaChange}*/}
            {/*        minRows={3}*/}
            {/*        required*/}
            {/*    />*/}
            {/*</FormControl>*/}

            <FormControl sx={{ mb: 2 }}>
                <FormLabel>What posts or writing samples are your favorite?<span
                    style={{color: 'red'}}>*</span></FormLabel>
                <Textarea
                    name="favoritePosts"
                    value={formData.favoritePosts}
                    onChange={handleTextAreaChange}
                    minRows={3}
                    required
                />
                <FormHelperText>
                    If you haven't written social media posts yet, that's okay, any email or texts you wrote before or want to write now, to give our AI content writer a good idea of your authentic style of writing and thought processing
                </FormHelperText>
            </FormControl>

            <FormControl sx={{ mb: 2 }}>
                <FormLabel>What posts or writing samples were best performing with your audience?<span
                    style={{color: 'red'}}>*</span></FormLabel>
                <Textarea
                    name="bestPosts"
                    value={formData.bestPosts}
                    onChange={handleTextAreaChange}
                    minRows={3}
                    required
                />
                <FormHelperText>
                    It doesn't have to be a social media post, it could be a script from a talk or a presentation you gave, an email, a journal entry or anything that you've seen people react very positively to
                </FormHelperText>
            </FormControl>

            <FormControl sx={{ mb: 2 }}>
                <FormLabel>Upload performance analytics of your top posts<span
                    style={{color: 'red'}}>*</span></FormLabel>
                <input
                    type="file"
                    name="analyticsFiles"
                    multiple
                    required
                    onChange={handleFileChange}
                />
                {formData.analyticsFiles.length > 0 && (
                    <FormHelperText>
                        Selected Files: {formData.analyticsFiles.map(file => file.name).join(', ')}
                    </FormHelperText>
                )}
                <FormHelperText>
                    If you have LinkedIn Premium, export your post analytics directly. Otherwise, feel free to upload screenshots.
                </FormHelperText>
            </FormControl>

            <FormControl sx={{ mb: 2 }}>
                <FormLabel>How many posts would you like to create?<span style={{color: 'red'}}>*</span></FormLabel>
                <Input
                    name="postsToCreate"
                    type="number"
                    value={formData.postsToCreate}
                    onChange={handleChange}
                    required
                />
                <FormHelperText>Choose between 5 and 10 posts.</FormHelperText>
            </FormControl>

            <FormControl sx={{ mb: 2 }}>
                <FormLabel>What’s the purpose of these posts?<span style={{color: 'red'}}>*</span></FormLabel>
                <Select
                    name="postPurpose"
                    value={formData.postPurpose}
                    onChange={handleSelectChange('postPurpose')}
                    required
                >
                    <Option value="Building up to News">Building up to News</Option>
                    <Option value="Provide Information">Provide Information</Option>
                    <Option value="Foster Audience Relationships">Foster Audience Relationships</Option>
                    <Option value="Promote Something">Promote Something</Option>
                    <Option value="Expand your Network">Expand your Network</Option>
                </Select>
            </FormControl>

            <FormControl sx={{ mb: 2 }}>
                <FormLabel>Companies on LinkedIn that inspire you (paste links)</FormLabel>
                <Textarea
                    name="inspiringCompanies"
                    value={formData.inspiringCompanies}
                    onChange={handleTextAreaChange}
                    minRows={3}
                />
            </FormControl>

            <FormControl sx={{ mb: 2 }}>
                <FormLabel>Timeline for the Posts <span style={{color: 'red'}}>*</span></FormLabel>
                <Select
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleSelectChange('timeline')}
                    required
                >
                    <Option value="1 weeks">1 weeks</Option>
                    <Option value="2 weeks">2 weeks</Option>
                    <Option value="3 weeks">3 weeks</Option>
                    <Option value="1 month">1 month</Option>
                </Select>
            </FormControl>

            <FormControl sx={{ mb: 2 }}>
                <FormLabel>Any thoughts or ideas for your LinkedIn series</FormLabel>
                <Textarea
                    // name="bestPosts"
                    // value={formData.bestPosts}
                    // onChange={handleTextAreaChange}
                    minRows={3}
                />
            </FormControl>

            <Button type="submit" sx={{ mt: 2 }} fullWidth>
                Submit
            </Button>
        </Box>
    );
};

export default InFavForm;
