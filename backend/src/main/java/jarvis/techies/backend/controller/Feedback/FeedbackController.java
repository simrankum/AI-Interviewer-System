package jarvis.techies.backend.controller.Feedback;


import jarvis.techies.backend.entity.Feedback;
import jarvis.techies.backend.entity.Job;
import jarvis.techies.backend.service.FeedbackService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin("*")
@AllArgsConstructor
@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

  private FeedbackService feedbackService;

  @PostMapping
  public ResponseEntity<Feedback> createFeedbackform(@RequestBody Feedback feedback) {
    Feedback savedFeedback = feedbackService.save(feedback);
    return new ResponseEntity<>(savedFeedback, HttpStatus.CREATED);
  }

  @PutMapping("/updatedFeedback")
  public ResponseEntity<Feedback> updateFeedback(@RequestBody Feedback feedback) {

    Feedback savedFeedback = feedbackService.update(feedback);
    return new ResponseEntity<>(savedFeedback, HttpStatus.OK);
  }

  @GetMapping("{id}")
  public ResponseEntity<Feedback> getFeedbackform(
    @PathVariable("id") Long id) {

    Feedback feedback = feedbackService.findById(id);
    return new ResponseEntity<>(feedback, HttpStatus.OK);

  }
  @GetMapping
  public ResponseEntity<List<Feedback>> getAllFeedbacks(){
    List<Feedback> feedbacks = feedbackService.getAllFeedbacks();
    return ResponseEntity.ok(feedbacks);
  }
}
