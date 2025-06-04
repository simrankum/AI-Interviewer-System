package jarvis.techies.backend.service;
import jarvis.techies.backend.entity.Job;

import java.util.List;

public interface JobService {
    Job createJob(Job jobDto);
    Job getJobByID(Long id);
    List<Job> getAllJobs();
    Job updateJob(Long jobId,Job jobDto);
    void deleteJob(Long id);
}

