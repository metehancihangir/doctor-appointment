import React, { useState } from 'react';
import useDoctors from '../../hooks/useDoctors';
import SearchFilter from '../../components/SearchFilter';
import DoctorCard from '../../components/DoctorCard';
import Pagination from '../../components/Pagination';
import SkeletonCard from '../../components/SkeletonCard';
import './DoctorsPage.css';

const DoctorsPage = () => {
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { doctors, totalCount, isLoading, error } = useDoctors(search, specialty, page, pageSize);

  const totalPages = Math.ceil(totalCount / pageSize);

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1); // Arama değiştiğinde ilk sayfaya dön
  };

  const handleSpecialtyChange = (val) => {
    setSpecialty(val);
    setPage(1); // Filtre değiştiğinde ilk sayfaya dön
  };

  const handleClear = () => {
    setSearch('');
    setSpecialty('');
    setPage(1);
  };

  return (
    <div className="container doctors-page">
      <header className="page-header">
        <h1>Doktorlarımız</h1>
        <p>İhtiyacınız olan uzmanı bulun ve hemen randevu alın.</p>
      </header>

      <SearchFilter 
        search={search}
        onSearchChange={handleSearchChange}
        specialty={specialty}
        onSpecialtyChange={handleSpecialtyChange}
        onClear={handleClear}
      />

      {error && <div className="error-alert">{error}</div>}

      {isLoading ? (
        <div className="doctors-grid">
          <SkeletonCard variant="doctor" />
          <SkeletonCard variant="doctor" />
          <SkeletonCard variant="doctor" />
          <SkeletonCard variant="doctor" />
          <SkeletonCard variant="doctor" />
          <SkeletonCard variant="doctor" />
        </div>
      ) : (
        <>
          {doctors.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>Sonuç Bulunamadı</h3>
              <p>Arama kriterlerinize uygun doktor bulunamadı. Lütfen filtreleri değiştirerek tekrar deneyin.</p>
            </div>
          ) : (
            <div className="doctors-grid">
              {doctors.map(doctor => (
                <DoctorCard key={doctor.doctorId} doctor={doctor} />
              ))}
            </div>
          )}

          <Pagination 
            currentPage={page} 
            totalPages={totalPages} 
            onPageChange={setPage} 
          />
        </>
      )}
    </div>
  );
};

export default DoctorsPage;
