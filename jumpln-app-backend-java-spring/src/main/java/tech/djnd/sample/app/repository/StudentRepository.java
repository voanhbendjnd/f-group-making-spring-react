package tech.djnd.sample.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tech.djnd.sample.app.domain.Student;
import tech.djnd.sample.app.service.projection.StudentRow;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long>, JpaSpecificationExecutor<Student> {
    List<Student> findByRollNumberIn(List<String> rollNumbers);

    List<Student> findByMemberCodeIgnoreCaseIn(List<String> memberCodes);


    @Query(value = """
        select s.userId as userId, s.rollNumber as rollNumber, u.name as fullName,
               s.majorCode as majorCode, s.majorId as majorId,
               s.memberCode as memberCode, u.activated as activated, u.activationKeyExpiresAt as activationKeyExpiresAt,
               u.createdDate as createDate, u.lastModifiedDate as lastModifiedDate
        from Student s
        join User u
        where s.userId = :userId
    """)
    Optional<StudentRow> findStudentProjectionById(@Param("userId") Long userId);
}
