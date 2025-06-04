package jarvis.techies.backend.service.impl;


import jarvis.techies.backend.entity.Job;
import jarvis.techies.backend.exception.ResourceNotFoundException;
import jarvis.techies.backend.repository.JobRepository;
import jarvis.techies.backend.service.JobService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class JobServiceImpl implements JobService {

    private JobRepository jobRepository;

    @Override
    public Job createJob(Job job) {
        return jobRepository.save(job);
    }

    @Override
    public Job getJobByID(Long jobId) {
        return jobRepository.findById(jobId)
                .orElseThrow(()->
                        new ResourceNotFoundException("Job not found with given ID"+jobId));
    }

    @Override
    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    @Override
    public Job updateJob(Long jobId, Job updatedJob) {
        Job job =jobRepository.findById(jobId).orElseThrow(
                () -> new ResourceNotFoundException("Job does not exist with given ID"));
        job.setJobStatus(updatedJob.getJobStatus());
        job.setJobTitle(updatedJob.getJobTitle());
        job.setEducation(updatedJob.getEducation());
        job.setSkills(updatedJob.getSkills());
        job.setExperience(updatedJob.getExperience());
        job.setDescription(updatedJob.getDescription());
        job.setJobType(updatedJob.getJobType());
        job.setLocation(updatedJob.getLocation());
        job.setLocationType(updatedJob.getLocationType());
        job.setPostedDate(updatedJob.getPostedDate());

        return jobRepository.save(job);
    }

    @Override
    public void deleteJob(Long jobId) {
        jobRepository.findById(jobId).orElseThrow(
                () -> new ResourceNotFoundException("Job does not exist with given ID"));
        jobRepository.deleteById((jobId));
    }
}
