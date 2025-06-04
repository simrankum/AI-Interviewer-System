package jarvis.techies.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobCandidateResponse {
    private boolean success;
    private JobCandidateData data;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JobCandidateData {
        private String jobId;
        private String jobTitle;
        private String company;
        private List<CandidateResult> results;
        private String savedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CandidateResult {
        private String id;
        private String fileName;
        private String status;
        private double matchScore;
        private List<String> skills;
        private List<String> matched_skills;
        private String feedback;
        private JobDetails jobDetails;
        private String candidateName;
        private String email;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JobDetails {
        private String jobId;
        private String jobTitle;
       // private String company;
    }
}