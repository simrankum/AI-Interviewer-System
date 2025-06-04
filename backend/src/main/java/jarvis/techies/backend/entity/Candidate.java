package jarvis.techies.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name= "candidate")
public class Candidate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long candidateId;

    @Column(name ="first_name")
    private String firstname;

    @Column(name= "last_name")
    private String lastname;

    @Column(name = "email_id", nullable = false, unique = true)
    private String email;

    @Column(name ="fitScore")
    private Double fitScore;

    @Column(name ="status")
    private String status;

    @Column(name ="resumeResult")
    private String resumeResult;

    @Column(name ="description")
    private String description;

    @Column(name="skillSet")
    private String skillSet;

    @Column(name="matched_skills")
    private String matchedSkills;

    @Column(name="jobId")
    private Long jobId;

}
