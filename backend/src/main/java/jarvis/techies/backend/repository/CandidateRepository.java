package jarvis.techies.backend.repository;

import jarvis.techies.backend.entity.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CandidateRepository extends JpaRepository<Candidate, Long> {


  List<Candidate> findByStatus(String status);
  List<Candidate> findByStatusAndJobId(String status, Long jobId);
  List<Candidate> findByJobId(Long jobId);

}
