package jarvis.techies.backend.controller.JobDesc;

import jarvis.techies.backend.entity.Job;
import jarvis.techies.backend.service.JobService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin("*")
@AllArgsConstructor
@Slf4j
@RestController
@RequestMapping("api/jobs")
public class JobController {

    private JobService jobService;

    @PostMapping
    public ResponseEntity<Job> createJob(@RequestBody Job jobDto){
        Job savedJob = jobService.createJob(jobDto);
        return new ResponseEntity<>(savedJob, HttpStatus.CREATED);

    }
    @GetMapping("{id}")
    public ResponseEntity<Job> getJobById(@PathVariable("id") Long jobId){
        Job jobDto = jobService.getJobByID(jobId);
        return ResponseEntity.ok(jobDto);
    }

    @GetMapping
    public ResponseEntity<List<Job>> getAllJobs(){
        List<Job> jobs = jobService.getAllJobs();
        return ResponseEntity.ok(jobs);
    }

    @PutMapping("{id}")
    public ResponseEntity<Job> updateJob(@PathVariable("id") Long jobId,
                                            @RequestBody Job updatedJob ){
       Job updatedJobEntry = jobService.updateJob(jobId, updatedJob);
       log.info("updating the entry");
        return ResponseEntity.ok(updatedJobEntry);
    }

    @DeleteMapping("{id}")
    public ResponseEntity<String> deleteJob(@PathVariable("id") Long jobId){
        jobService.deleteJob(jobId);
        return ResponseEntity.ok("Job Deleted");
    }

}
