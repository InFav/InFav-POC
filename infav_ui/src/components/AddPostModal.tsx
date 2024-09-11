import React, { useState } from 'react';
import { Box, Button, Modal, Textarea, FormControl, FormLabel, CircularProgress } from "@mui/joy";

const AddPostModal: React.FC<{ onSubmit: (newPostDetails: any) => Promise<void> }> = ({ onSubmit }) => {
    const [open, setOpen] = useState(false);
    const [newPostDetails, setNewPostDetails] = useState({
        taskName: '',
        taskDetails: '',
        lessonsLearnt: ''
    });
    const [loading, setLoading] = useState(false);  // New loading state

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewPostDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setLoading(true);  // Set loading to true when submitting
        await onSubmit(newPostDetails);
        setLoading(false);  // Stop loading once the submission is done
        handleClose();
    };

    return (
        <>
            <Button onClick={handleOpen}>Add Post</Button>
            <Modal open={open} onClose={handleClose}>
                <Box
                    sx={{
                        p: 4,
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        width: 400,
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',  // Center the modal
                        boxShadow: 24
                    }}
                >
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <FormControl sx={{ mb: 2 }}>
                                <FormLabel>Task Name</FormLabel>
                                <Textarea
                                    name="taskName"
                                    value={newPostDetails.taskName}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl sx={{ mb: 2 }}>
                                <FormLabel>Elaborate on the task you completed</FormLabel>
                                <Textarea
                                    name="taskDetails"
                                    value={newPostDetails.taskDetails}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <FormControl sx={{ mb: 2 }}>
                                <FormLabel>What lessons did you learn? Whom did you meet? Any insights you want to share?</FormLabel>
                                <Textarea
                                    name="lessonsLearnt"
                                    value={newPostDetails.lessonsLearnt}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <Button onClick={handleSubmit}>Submit</Button>
                        </>
                    )}
                </Box>
            </Modal>
        </>
    );
};

export default AddPostModal;
