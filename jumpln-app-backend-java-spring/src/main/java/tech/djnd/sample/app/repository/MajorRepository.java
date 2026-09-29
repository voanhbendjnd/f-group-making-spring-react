package tech.djnd.sample.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tech.djnd.sample.app.domain.Major;

import java.util.Optional;

@Repository
public interface MajorRepository extends JpaRepository<Major, Integer> {

    /**
     * Tìm Major theo code (ví dụ: "CHN", "SE", "AI").
     * Dùng khi parse majorCode từ originalMajor trong file Excel.
     */
    Optional<Major> findByCode(String code);

    /**
     * Kiểm tra major có tồn tại với code đã cho không.
     * Dùng nhanh hơn findByCode nếu chỉ cần validate.
     */
    boolean existsByCode(String code);
}
