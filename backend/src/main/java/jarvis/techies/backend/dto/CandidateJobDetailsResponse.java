package jarvis.techies.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CandidateJobDetailsResponse {
    private String job_role;
    private String industry;
    private String experience_level;
    private String candidate_background;
    private int question_count;
}
