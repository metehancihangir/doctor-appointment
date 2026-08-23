import { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosInstance';

export const usePatientAppointments = (initialStatus = '', initialDateRange = { startDate: null, endDate: null }, pageSize = 10) => {
  const [appointments, setAppointments] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [dateFilter, setDateFilter] = useState(initialDateRange);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('pageSize', pageSize);

      if (statusFilter && statusFilter !== 'Tümü') {
        params.append('status', statusFilter);
      }

      if (dateFilter.startDate) {
        params.append('startDate', dateFilter.startDate.toISOString().split('T')[0]);
      }

      if (dateFilter.endDate) {
        params.append('endDate', dateFilter.endDate.toISOString().split('T')[0]);
      }

      const response = await api.get(`/appointments/my?${params.toString()}`);
      setAppointments(response.data.appointments);
      setTotalCount(response.data.totalCount);
    } catch (err) {
      setError(err.response?.data?.message || 'Randevular yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, statusFilter, dateFilter]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    totalCount,
    page,
    setPage,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    isLoading,
    error,
    refresh: fetchAppointments // İptal işleminden sonra listeyi güncellemek için
  };
};
