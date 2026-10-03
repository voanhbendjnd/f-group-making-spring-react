package tech.djnd.sample.app.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.io.Serial;
import java.io.Serializable;
@Entity
@Table(name = "majors")
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Major extends AbstractAuditingEntity <Integer> implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;
    @NotNull
    @Column(name = "code", unique = true,  nullable = false)
    String code;

    @NotNull
    @Column(name = "name", unique = true)
    String name;

}
