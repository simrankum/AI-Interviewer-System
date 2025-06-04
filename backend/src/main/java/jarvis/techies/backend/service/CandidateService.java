package jarvis.techies.backend.service;

import jarvis.techies.backend.dto.CandidateJobDetailsResponse;
import jarvis.techies.backend.dto.JobCandidateResponse;
import jarvis.techies.backend.entity.Candidate;

import java.util.List;

public interface CandidateService {
    // UserDto createUser(UserDto userDto);
    // UserDto getUserById(Long userId);

    Candidate createUser(Candidate candidate);
  //  Candidate getCandidateById(Candidate candidate);

    Candidate getCandidateById(Long candidateId);

    List<Candidate> getSelectedCandidates(String status);
    //methods to implement
    //1. Show all users- along with details
    List<Candidate> getCandidatesByStatusAndJobId(String status, Long jobId);
    Candidate updateCandidate(Long candidateId, Candidate candidateDetails);

    CandidateJobDetailsResponse getCandidateJobDetails(Long candidateId);

    JobCandidateResponse getCandidatesByJobId(Long jobId);

    }
