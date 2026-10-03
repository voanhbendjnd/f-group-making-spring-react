package tech.djnd.sample.app.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "students")
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)

public class Student{
    @Id
    @Column(name= "user_id")
    Long userId;
    @NotNull
    @Column(name = "roll_number",  nullable = false, unique = true)
    String rollNumber;
    @NotNull @Column(name = "full_name", nullable = false)
    String fullName;
    @NotNull
    @Column(name = "major_id", nullable = false)
    Integer majorId;
    @NotNull
    @Column(name = "major_code", nullable = false)
    String majorCode;
    @NotNull
    @Column(name = "member_code", nullable = false)
    String memberCode;
    @Column(name = "school_class_id")
    Integer schoolClassId;
    @Column(name = "group_id")
    Long groupId;
//    @NotNull
//    @Column(name = "email", nullable = false)
//    String email;

//    @OneToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "user_id", insertable = false, updatable = false)
//    User user;
}
