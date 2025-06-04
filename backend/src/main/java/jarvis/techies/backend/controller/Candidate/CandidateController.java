package jarvis.techies.backend.controller.Candidate;

import jarvis.techies.backend.dto.CandidateJobDetailsResponse;
import jarvis.techies.backend.dto.CandidateRequest;
import jarvis.techies.backend.dto.JobCandidateResponse;
import jarvis.techies.backend.service.CandidateService;
import jarvis.techies.backend.entity.Candidate;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@CrossOrigin("*")
@AllArgsConstructor
@RestController
@RequestMapping("/api/candidates")
public class CandidateController {

    private CandidateService candidateService;


    @PostMapping
    public ResponseEntity<Candidate> createUser(@RequestBody Candidate candidate){
        System.out.println("Registering user: " + candidate);
        Candidate savedCandidate = candidateService.createUser(candidate);
        return new ResponseEntity<>(savedCandidate, HttpStatus.CREATED);
    }

    @PostMapping("/uploadCandidates")
    public ResponseEntity<List<Candidate>> uploadCandidates(@RequestBody CandidateRequest request) {
        List<Candidate> savedCandidates = new ArrayList<>();

        for (CandidateRequest.Result result : request.getResults()) {
            Candidate candidate = new Candidate();

            // Split full name if needed
            String[] nameParts = result.getCandidateName().split(" ", 2);
            candidate.setFirstname(nameParts[0]);
            candidate.setLastname(nameParts.length > 1 ? nameParts[1] : "");

            candidate.setEmail(result.getEmail());
            candidate.setStatus(result.getStatus());
            candidate.setFitScore(result.getMatchScore());
            candidate.setDescription(result.getFeedback());
            candidate.setResumeResult(result.getFileName());
            candidate.setSkillSet(String.join(",", result.getSkills()));
            candidate.setMatchedSkills(String.join(",", result.getMatched_skills()));


            // Convert jobId to Long safely
            try {
                candidate.setJobId(Long.parseLong(request.getJobId()));
            } catch (NumberFormatException e) {
                candidate.setJobId(null); // or handle accordingly
            }

            Candidate saved = candidateService.createUser(candidate);
            savedCandidates.add(saved);
        }

        return new ResponseEntity<>(savedCandidates, HttpStatus.CREATED);
    }



    @GetMapping("{id}")
    public ResponseEntity<Candidate> getCandidateById(@PathVariable("id") Long candidateId) {
        Candidate candidate = candidateService.getCandidateById(candidateId);
        return ResponseEntity.ok(candidate);
    }
    @GetMapping("/selectedCandidates/{status}")
    public ResponseEntity<List<Candidate>> getCandidatesByStatus(@PathVariable("status") String status) {
        List<Candidate> candidateList = candidateService.getSelectedCandidates(status);
        return ResponseEntity.ok(candidateList);
    }
    @PutMapping("{id}")
    public ResponseEntity<Candidate> updateCandidate(@PathVariable("id") Long candidateId,
                                                     @RequestBody Candidate candidateDetails) {
        Candidate updatedCandidate = candidateService.updateCandidate(candidateId, candidateDetails);
        return ResponseEntity.ok(updatedCandidate);
    }
    @GetMapping("/job/{jobId}/status/{status}")
    public ResponseEntity<List<Candidate>> getCandidatesByJobIdAndStatus(
            @PathVariable("jobId") Long jobId,
            @PathVariable("status") String status) {

        List<Candidate> filteredCandidates = candidateService.getCandidatesByStatusAndJobId(status, jobId);
        return ResponseEntity.ok(filteredCandidates);
    }

    //to get data for the question generation
    @GetMapping("/candidateJobDetails/{candidateId}")
    public ResponseEntity<CandidateJobDetailsResponse> getCandidateJobDetails(@PathVariable Long candidateId) {
        CandidateJobDetailsResponse response = candidateService.getCandidateJobDetails(candidateId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/listOfCandidates/{jobId}")
    public ResponseEntity<JobCandidateResponse> getCandidatesByJob(@PathVariable Long jobId) {
        JobCandidateResponse response = candidateService.getCandidatesByJobId(jobId);
        return ResponseEntity.ok(response);
    }



    //1.List if candidates
    //2. Change of status
    //3. getCandidatesByStatus - jobid
    //update status based on interview results
    //store feedback by interview

}
