import React, { useState } from 'react';
import dayjs from 'dayjs';
import { Box, IconButton, Typography } from '@mui/joy';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AddIcon from '@mui/icons-material/Add';

const UserDashboard = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  
  const handlePrevMonth = () => {
    setCurrentDate(currentDate.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentDate(currentDate.add(1, 'month'));
  };

  const renderCalendar = () => {
    const daysInMonth = currentDate.daysInMonth();
    const calendarDays = [];

    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push(
        <Box
          key={i}
          sx={{
            flexBasis: 'calc(25% - 40px)',
            minWidth: '150px',
            border: '1px solid',
            borderColor: 'primary.main',
            borderRadius: 2,
            padding: 2,
            minHeight: 150,
            backgroundColor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Typography
            sx={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              mb: 1,
              textAlign: 'left',
            }}
          >
            {i}
          </Typography>

          <IconButton
            sx={{
              position: 'absolute',
              top: 13,
              left: i < 10 ? 25 : 35,
            }}
          >
            <AddIcon />
          </IconButton>
        </Box>
      );
    }

    return calendarDays;
  };

  return (
    <Box sx={{minHeight: '100vh' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        mb: 4,
        backgroundColor: '#fff',
        padding: '10px 20px',
      }}>
        <Typography
          sx={{
            fontSize: '2rem',
            color: '#333',
            fontWeight: 'bold',
            textShadow: '1px 1px 5px rgba(0,0,0,0.3)',
            position: 'absolute',
            left: 0,
          }}
        >
          Influence Navigator
        </Typography>
        
        <Box sx={{ 
          position: 'absolute',
          right: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}>
          <Typography
            sx={{
              cursor: 'pointer',
              padding: '5px 15px',
              borderRadius: '5px',
              fontSize: '1.5rem',
            }}
            onClick={() => window.location.href = '/form'}
          >
            Form
          </Typography>
          
          <Typography
            sx={{
              padding: '10px 15px',
              fontSize: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              borderRadius: '5px',
            }}
          >
            Welcome, Username
          </Typography>
        </Box>
      </Box>


      <Box sx={{ 
        padding: '20px 20px 0',  
        marginTop: '100px',       
        backgroundColor: '#f5f5f5',
      }}>
        <Box sx={{ paddingBottom: '20px', display: 'flex', justifyContent: 'flex-start', mb: 4 }}>
          <Typography
              sx={{
                fontSize: '1.75rem',
                fontWeight: 'bold',
                textAlign: 'left',
                width: '200px', 
              }}
          >
              Your Schedule
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, px: 2 }}>
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
          <IconButton onClick={handleNextMonth}>
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 0, 
          padding: '20px', 
          borderRadius: 2,
        }}>
          {renderCalendar()}
        </Box>
      </Box>
    </Box>
  );
};

export default UserDashboard;
