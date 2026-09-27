package tech.djnd.sample.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tech.djnd.sample.app.domain.MajorTerm;

@Repository
public interface MajorTermRepository extends JpaRepository<MajorTerm,Long> {
}
