import { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosInstance';

export const useDoctorAppointments = (initialStatus = 'Tümü', initialDateFilter = { startDate: null, endDate: null }, pageSize = 10) => {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ TodayCount: 0, PendingCount: 0, CompletedCount: 0, TotalCount: 0 });
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [dateFilter, setDateFilter] = useState(initialDateFilter);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      const response = await api.get('/doctor/stats');
      setStats(response.data);
    } catch (err) {
      console.error('İstatistikler alınırken hata oluştu:', err);
    }
  };

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      
      if (statusFilter !== 'Tümü') {
        params.append('status', statusFilter);
      }
      
      if (dateFilter.startDate) {
        params.append('startDate', dateFilter.startDate.toISOString().split('T')[0]);
      }
      if (dateFilter.endDate) {
        params.append('endDate', dateFilter.endDate.toISOString().split('T')[0]);
      }
      
      params.append('page', page);
      params.append('pageSize', pageSize);

      const response = await api.get(`/doctor/appointments?${params.toString()}`);
      setAppointments(response.data.appointments || []);
      setTotalCount(response.data.totalCount || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Randevular yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, dateFilter, pageSize]);

  useEffect(() => {
    fetchStats();
    fetchAppointments();
  }, [fetchAppointments]);

  const refresh = () => {
    fetchStats();
    fetchAppointments();
  };

  return {
    appointments,
    stats,
    totalCount,
    page,
    setPage,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    isLoading,
    error,
    refresh
  };
};
