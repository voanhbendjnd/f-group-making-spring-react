package tech.djnd.sample.app.repository;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
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
            String search,
            String majorCode,
            Boolean activated,
            Boolean hasActivationKey
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Avoid N+1 on select queries by fetch joining user
            if (query != null && Long.class != query.getResultType() && long.class != query.getResultType()) {
                root.fetch("user", JoinType.LEFT);
            }

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate rollNumber = cb.like(cb.lower(root.get("rollNumber")), pattern);
                Predicate fullName = cb.like(cb.lower(root.get("fullName")), pattern);
                Predicate email = cb.like(cb.lower(root.get("email")), pattern);
                Predicate memberCode = cb.like(cb.lower(root.get("memberCode")), pattern);
                predicates.add(cb.or(rollNumber, fullName, email, memberCode));
            }

            if (majorCode != null && !majorCode.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("majorCode")), "%" + majorCode.trim().toLowerCase() + "%"));
            }

            if (activated != null || hasActivationKey != null) {
                Join<Student, User> userJoin = root.join("user", JoinType.LEFT);

                if (activated != null) {
                    predicates.add(cb.equal(userJoin.get("activated"), activated));
                }

                if (hasActivationKey != null) {
                    Instant now = Instant.now();
                    if (Boolean.TRUE.equals(hasActivationKey)) {
                        predicates.add(cb.isNotNull(userJoin.get("activationKey")));
                        predicates.add(cb.greaterThan(userJoin.get("activationKeyExpiresAt"), now));
                    } else {
                        predicates.add(cb.or(
                                cb.isNull(userJoin.get("activationKey")),
                                cb.lessThanOrEqualTo(userJoin.get("activationKeyExpiresAt"), now)
                        ));
                    }
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
