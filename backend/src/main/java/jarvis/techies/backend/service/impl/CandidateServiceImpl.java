package jarvis.techies.backend.service.impl;


import jarvis.techies.backend.dto.CandidateJobDetailsResponse;
import jarvis.techies.backend.dto.JobCandidateResponse;
import jarvis.techies.backend.entity.Candidate;
import jarvis.techies.backend.entity.Job;
import jarvis.techies.backend.exception.ResourceNotFoundException;
import jarvis.techies.backend.repository.CandidateRepository;
import jarvis.techies.backend.repository.JobRepository;
import jarvis.techies.backend.service.CandidateService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class CandidateServiceImpl implements CandidateService {

  private CandidateRepository candidateRepository;
  private JobRepository jobRepository;

  @Override
  public Candidate createUser(Candidate candidate) {
    return candidateRepository.save(candidate);
  }

  @Override
  public Candidate getCandidateById(Long candidateId) {
    return
        candidateRepository
            .findById(candidateId)
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "User is not exist with given id :" + candidateId));
  //  return caninfo;
  }


  @Override
  public List<Candidate> getSelectedCandidates(String status) {
    return candidateRepository.findByStatus(status);
  }
  @Override
  public Candidate updateCandidate(Long candidateId, Candidate candidateDetails) {
    Candidate existingCandidate = candidateRepository.findById(candidateId)
            .orElseThrow(() -> new ResourceNotFoundException(
                    "Candidate not found with id: " + candidateId));
    existingCandidate.setCandidateId(candidateDetails.getCandidateId());
    existingCandidate.setEmail(candidateDetails.getEmail());
    existingCandidate.setStatus(candidateDetails.getStatus());
    existingCandidate.setJobId(candidateDetails.getJobId());
    existingCandidate.setDescription(candidateDetails.getDescription());
    existingCandidate.setFirstname(candidateDetails.getFirstname());
    existingCandidate.setFitScore(candidateDetails.getFitScore());
    existingCandidate.setLastname(candidateDetails.getLastname());
    existingCandidate.setResumeResult(candidateDetails.getResumeResult());
    existingCandidate.setSkillSet(candidateDetails.getSkillSet());

    return candidateRepository.save(existingCandidate);
  }
  @Override
  public List<Candidate> getCandidatesByStatusAndJobId(String status, Long jobId) {
    return candidateRepository.findByStatusAndJobId(status, jobId);
  }

  public CandidateJobDetailsResponse getCandidateJobDetails(Long candidateId) {
    Candidate candidate = candidateRepository.findById(candidateId)
            .orElseThrow(() -> new RuntimeException("Candidate not found"));

    Job job = jobRepository.findById(candidate.getJobId())
            .orElseThrow(() -> new RuntimeException("Job not found"));

    return new CandidateJobDetailsResponse(
            job.getJobTitle(),
            "Technical/Software",
            job.getExperience(),
            candidate.getSkillSet(),
            2
    );
  }




  ///to show list of candidates based on jobId
  public JobCandidateResponse getCandidatesByJobId(Long jobId) {
    List<Candidate> candidates = candidateRepository.findByJobId(jobId);
    Optional<Job> jobOptional = jobRepository.findById(jobId);

    if (jobOptional.isEmpty()) throw new RuntimeException("Job not found");

    Job job = jobOptional.get();
    List<JobCandidateResponse.CandidateResult> results = candidates.stream().map(candidate -> {
      JobCandidateResponse.JobDetails jobDetails = new JobCandidateResponse.JobDetails(
              String.valueOf(job.getJobId()),
              job.getJobTitle()
      );

      return new JobCandidateResponse.CandidateResult(
              "resume-" + candidate.getCandidateId(), // unique id
              candidate.getResumeResult(), // assuming this stores fileName
              candidate.getStatus(),
              candidate.getFitScore(),
              Arrays.asList(candidate.getSkillSet().split(",")),
              Arrays.asList(candidate.getMatchedSkills().split(",")),
              candidate.getDescription(),
              jobDetails,
              candidate.getFirstname() + " " + candidate.getLastname(),
              candidate.getEmail()
      );
    }).toList();

    JobCandidateResponse.JobCandidateData data = new JobCandidateResponse.JobCandidateData(
            String.valueOf(jobId),
            job.getJobTitle(),
            "Not specified",
            results,
            LocalDateTime.now().toString()
    );

    return new JobCandidateResponse(true, data);
  }


}
