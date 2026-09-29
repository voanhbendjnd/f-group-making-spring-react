package tech.djnd.sample.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import tech.djnd.sample.app.domain.Student;

import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long>, JpaSpecificationExecutor<Student> {

    /**
     * Kiểm tra sinh viên đã tồn tại theo rollNumber chưa.
     * Dùng trong quá trình validate import Excel.
     */
    boolean existsByRollNumber(String rollNumber);

    /**
     * Kiểm tra rollNumber đã tồn tại trong danh sách (batch check).
     * Dùng để tối ưu: chỉ gọi DB 1 lần thay vì N lần cho N dòng.
     */
    List<Student> findByRollNumberIn(List<String> rollNumbers);

    List<Student> findByEmailIn(List<String> emails);
    List<Student> findByMemberCodeIgnoreCaseIn(List<String> memberCodes);
}
