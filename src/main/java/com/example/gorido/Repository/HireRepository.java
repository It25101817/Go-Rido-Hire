package com.example.gorido.Repository;
import com.example.gorido.Model.Hire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface HireRepository extends JpaRepository<Hire, Integer> {
    @Query("SELECT h FROM Hire h " +
            "WHERE h.driver.id = :driverId " +
            "ORDER BY h.starting_at DESC")
    List<Hire> findByDriverId(@Param("driverId") int driverId);

    @Query("SELECT h FROM Hire h " +
            "WHERE h.hireStatus.id = 1 " +
            "AND h.vehicleType.id IN :vtpIds " +
            "AND FUNCTION('DATE', h.starting_at) >= CURRENT_DATE " +
            "ORDER BY h.requested_at DESC")
    List<Hire> findMatchingHires(@Param("vtpIds") List<Integer> vtpIds);

    @Query("SELECT h FROM Hire h " +
            "WHERE h.user.id = :userId " +
            "ORDER BY h.requested_at DESC")
    List<Hire> findByUserIdOrderByRequestedAtAsc(@Param("userId") int userId);

    @Query("SELECT COUNT(h) FROM Hire h WHERE DATE(h.starting_at) = CURRENT_DATE")
    long countTodayRides();

    @Query(value = "SELECT * FROM hire ORDER BY requested_at DESC LIMIT 6", nativeQuery = true)
    List<Hire> findLatest5Hires();

    @Query("SELECT h FROM Hire h " +
            "WHERE h.driver.id = :driverId " +
            "AND DATE(h.starting_at) > CURRENT_DATE " +
            "ORDER BY h.starting_at DESC")
    List<Hire> findByDriverIdOrderByRequestedAtAsc(@Param("driverId") int driverId);

    @Query("SELECT h FROM Hire h " +
            "WHERE h.driver.id = :driverId " +
            "AND h.hireStatus.id != 4 " +
            "AND DATE(h.starting_at) = CURRENT_DATE " +
            "ORDER BY h.starting_at DESC")
    List<Hire> findTodayHiresByDriverId(@Param("driverId") int driverId);

    @Query("SELECT h FROM Hire h " +
            "WHERE h.driver.id = :driverId " +
            "AND DATE(h.starting_at) < CURRENT_DATE " +
            "ORDER BY h.starting_at DESC")
    List<Hire> findTodayHiresByDriverIdOldHires(@Param("driverId") int driverId);

    @Query("SELECT h FROM Hire h " +
            "WHERE h.user.id = :userId " +
            "AND FUNCTION('DATE', h.starting_at) = CURRENT_DATE " +
            "AND h.payment IS NOT NULL " +
            "AND h.hireStatus.id != 3 " +
            "ORDER BY h.starting_at DESC")
    List<Hire> findTodayHires(@Param("userId") int userId);

    @Query("SELECT h FROM Hire h " +
            "WHERE h.user.id = :userId " +
            "AND h.starting_at >= :tomorrow " +
            "AND h.payment IS NOT NULL " +
            "AND h.hireStatus.id != 3 " +
            "ORDER BY h.starting_at DESC")
    List<Hire> findUpcomingHires(@Param("userId") int userId, @Param("tomorrow") LocalDateTime tomorrow);

    @Query("SELECT h FROM Hire h " +
            "WHERE h.user.id = :userId " +
            "AND h.starting_at < CURRENT_DATE " +
            "AND h.payment IS NOT NULL " +
            "AND h.hireStatus.id != 3 " +
            "ORDER BY h.starting_at DESC")
    List<Hire> findPastHires(@Param("userId") int userId);

    @Query("SELECT h FROM Hire h " +
            "WHERE h.user.id = :userId " +
            "AND h.payment IS NULL " +
            "ORDER BY h.requested_at DESC")
    List<Hire> findByUserIdPaymentsAtDesc(@Param("userId") int userId);

    @Query("SELECT h FROM Hire h " +
            "WHERE h.user.id = :userId " +
            "AND h.payment IS NOT NULL " +
            "ORDER BY h.requested_at DESC")
    List<Hire> findByUserIdPaymentsHistoryAtDesc(@Param("userId") int userId);

    @Query("SELECT h FROM Hire h " +
            "WHERE h.user.id = :userId " +
            "ORDER BY h.requested_at DESC")
    List<Hire> findTop3ByUserId(@Param("userId") int userId);
}
