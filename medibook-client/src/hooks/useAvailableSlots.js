import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

export const useAvailableSlots = (doctorId, selectedDate) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!doctorId || !selectedDate) {
      setSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setLoading(true);
      setError(null);
      try {
        // Date formatini YYYY-MM-DD sekline getir
        const dateString = selectedDate.toISOString().split('T')[0];
        const response = await api.get(`/doctors/${doctorId}/slots?date=${dateString}`);
        setSlots(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Slotlar yüklenirken bir hata oluştu.');
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [doctorId, selectedDate]);

  return { slots, loading, error };
};
