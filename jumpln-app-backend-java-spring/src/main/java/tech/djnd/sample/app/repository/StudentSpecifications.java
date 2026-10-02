package tech.djnd.sample.app.repository;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.jpa.domain.Specification;
import tech.djnd.sample.app.domain.Student;
import tech.djnd.sample.app.domain.User;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public final class StudentSpecifications {

    private StudentSpecifications() {
    }

    public static Specification<Student> withFilter(
            String search, String majorCode, Boolean activated, Boolean hasActivationKey) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // chỉ fetch khi query trả về entity Student (tránh N+1)
            if (query != null && Student.class.equals(query.getResultType())) {
                root.fetch("user", JoinType.LEFT);
            }

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("rollNumber")), pattern),
                        cb.like(cb.lower(root.get("fullName")), pattern),
                        cb.like(cb.lower(root.get("memberCode")), pattern)
                ));
            }

            if (majorCode != null && !majorCode.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("majorCode")),
                        "%" + majorCode.trim().toLowerCase() + "%"));
            }

            if (activated != null || hasActivationKey != null) {
                Join<Student, User> userJoin = getUserJoin(root);
                if (activated != null) {
                    predicates.add(cb.equal(userJoin.get("activated"), activated));
                }

                if (hasActivationKey != null) {
                    Instant now = Instant.now();
                    if (hasActivationKey) {
                        predicates.add(cb.isNotNull(userJoin.get("activationKey")));
                        predicates.add(cb.greaterThan(userJoin.get("activationKeyExpiresAt"), now));
                    } else {
                        predicates.add(cb.or(
                                cb.isNull(userJoin.get("activationKey")),
                                cb.lessThanOrEqualTo(userJoin.get("activationKeyExpiresAt"), now)
                        ));
                    }
                }            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    @SuppressWarnings("unchecked")
    private static Join<Student, User> getUserJoin(Root<Student> root) {
        return root.getJoins().stream()
                .filter(j -> "user".equals(j.getAttribute().getName()))
                .map(j -> (Join<Student, User>) j)
                .findFirst()
                .orElseGet(() -> root.join("user", JoinType.LEFT));
    }
}
