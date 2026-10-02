package tech.djnd.sample.app.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.query.QueryUtils;
import org.springframework.stereotype.Repository;
import tech.djnd.sample.app.domain.Student;
import tech.djnd.sample.app.domain.User;
import tech.djnd.sample.app.service.projection.StudentRow;

import java.util.List;

@Repository
public class StudentQueryRepository {

    private final EntityManager entityManager;

    public StudentQueryRepository(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public Page<StudentRow> search(Specification<Student> spec, Pageable pageable) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        // ---- data query ----
        CriteriaQuery<StudentRow> cq = cb.createQuery(StudentRow.class);
        Root<Student> root = cq.from(Student.class);
        Root<User> user = cq.from(User.class);
        Predicate studentUserCondition = cb.equal(root.get("userId"), user.get("id"));
//        Join<Student, User> user = root.join("user", JoinType.LEFT);
        Predicate predicate = spec.toPredicate(root, cq, cb);
        if(predicate!=null){
            cq.where(
                    cb.and(
                            studentUserCondition,
                            predicate
                    )
            );
        }
        else{
            cq.where(studentUserCondition);
        }
        cq.select(cb.construct(StudentRow.class,
                root.get("userId"),
                root.get("rollNumber"),
                root.get("fullName"),
                root.get("memberCode"),
                root.get("majorId"),
                root.get("majorCode"),
                user.get("activated"),
                user.get("activationKey"),
                user.get("activationKeyExpiresAt"),
                user.get("createdDate"),
                user.get("lastModifiedDate")));

//        Predicate predicate = spec.toPredicate(root, cq, cb);
//        if (predicate != null) cq.where(predicate);

        if (pageable.getSort().isSorted()) {
            cq.orderBy(
                    QueryUtils.toOrders(
                            pageable.getSort(),
                            root,
                            cb
                    )
            );        }

        List<StudentRow> content = entityManager.createQuery(cq)
                .setFirstResult((int) pageable.getOffset())
                .setMaxResults(pageable.getPageSize())
                .getResultList();

        // ---- count query ----
        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<Student> countRoot = countQuery.from(Student.class);
        countQuery.select(cb.count(countRoot));
        Predicate countPredicate = spec.toPredicate(countRoot, countQuery, cb);
        if (countPredicate != null) countQuery.where(countPredicate);

        long total = entityManager.createQuery(countQuery).getSingleResult();

        return new PageImpl<>(content, pageable, total);
    }
}
