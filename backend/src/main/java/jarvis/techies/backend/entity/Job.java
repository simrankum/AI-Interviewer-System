package jarvis.techies.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name="jobs")
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long jobId;

    @Column(name="jobTitle")
    private String jobTitle;

    @Column(name ="jobStatus")
    private String jobStatus;

    @Column(name ="experience")
    private String experience;

    @Column(name ="education")
    private String education;

    @Column(name ="skills")
    private String skills;

    @Column(name ="summary")
    private String description;

    @Column(name = "location")
    private String location;

    @Column(name = "locationType")
    private String locationType;

    @Column(name = "jobType")
    private String jobType;

    @Column(name = "postedDate")
    private LocalDate postedDate;

}
