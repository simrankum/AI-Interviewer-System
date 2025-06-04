package jarvis.techies.backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class CandidateRequest {
    private String jobId;  // changed from jobDetails
    private String jobTitle;
    private List<Result> results;

    @Data
    public static class Result {
        private String id;
        private String fileName;
        private String candidateName;
        private String email;
        private List<String> skills;
        private String status;
        private double matchScore;
        private List<String> matched_skills;
        private String feedback;
    }
}
