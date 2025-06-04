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
@Table(name="feedback")
public class Feedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long Id;

    @Column(name = "candidateId")
    private Long candidateId;

    @Column(name = "jobId")
    private Long jobId;

    @Column(name="jobTitle")
    private String jobTitle;

    @Column(name="interviewDate")
    private LocalDate interviewDate;

    @Column(name="interviewerName")
    private String interviewerName;

    @Column(name="technicalRating")
    private int technicalSkills;

    @Column(name="communicationSkillsRating")
    private int communicationSkills;

    @Column(name="problemSolvingRating")
    private int problemSolving;

    @Column(name="culturalFit")
    private int culturalFit;

    @Column(name="relevantExp")
    private int experience;

    @Column(name="keyStrength")
    private String keyStrength;

    @Column(name="areaofImprovement")
    private String areasForImprovement;

    @Column(name="overallAssement")
    private String overallAssement;

    @Column(name="finalResult")
    private String hiringRecommendation;
}
