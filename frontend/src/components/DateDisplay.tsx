import React, { useState, useEffect } from 'react';
import { getDate } from '../services/noteService';

const DateDisplay: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDate = async () => {
      try {
        const date = await getDate();
        setCurrentDate(date);
      } catch (error) {
        console.error('Failed to fetch date:', error);
        setCurrentDate('Unable to load date');
      } finally {
        setLoading(false);
      }
    };

    fetchDate();
  }, []);

  if (loading) {
    return <p className="date-display">Loading date...</p>;
  }

  return (
    <p className="date-display" style={{ color: '#666', fontSize: '1.1rem', marginTop: '-10px', marginBottom: '20px' }}>
      {currentDate}
    </p>
  );
};

export default DateDisplay;
