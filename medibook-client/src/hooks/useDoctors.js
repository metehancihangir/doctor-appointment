import { useState, useEffect, useRef } from 'react';
import api from '../api/axiosInstance';

const useDoctors = (search, specialty, page, pageSize = 10) => {
    const [doctors, setDoctors] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const debounceTimeout = useRef(null);

    useEffect(() => {
        const fetchDoctors = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                let url = `/doctors?page=${page}&pageSize=${pageSize}`;
                if (search) url += `&search=${encodeURIComponent(search)}`;
                if (specialty) url += `&specialty=${encodeURIComponent(specialty)}`;

                const response = await api.get(url);
                setDoctors(response.data.doctors);
                setTotalCount(response.data.totalCount);
            } catch (err) {
                setError(err.response?.data?.message || 'Doktorlar yüklenirken bir hata oluştu.');
            } finally {
                setIsLoading(false);
            }
        };

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(() => {
            fetchDoctors();
        }, 300); // 300ms debounce

        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, [search, specialty, page, pageSize]);

    return { doctors, totalCount, isLoading, error };
};

export default useDoctors;
