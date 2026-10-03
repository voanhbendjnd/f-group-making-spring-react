package tech.djnd.sample.app.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "lecturers")
public class Lecturer{
    @Id
    @Column(name = "user_id")
    Long userId;
}
