package jarvis.techies.backend.service;

import jarvis.techies.backend.entity.Feedback;
import jarvis.techies.backend.entity.Job;

import java.util.List;


public interface FeedbackService  {

    Feedback save(Feedback feedback);
    Feedback update(Feedback feedback);
    Feedback findById(Long feebackId);
    List<Feedback> getAllFeedbacks();


}
