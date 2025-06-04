package jarvis.techies.backend.service.impl;
import jarvis.techies.backend.entity.Feedback;
import jarvis.techies.backend.entity.Job;
import jarvis.techies.backend.exception.ResourceNotFoundException;
import jarvis.techies.backend.repository.FeedbackRepository;
import jarvis.techies.backend.service.FeedbackService;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@NoArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {

  @Autowired
  FeedbackRepository feedbackRepository;

  @Override
  public Feedback save(Feedback feedback) {

    return feedbackRepository.save(feedback);
  }

  @Override
  public Feedback update(Feedback feedback) {
    Feedback oldFeedback = feedbackRepository.getReferenceById(feedback.getId());
    oldFeedback.setHiringRecommendation(feedback.getHiringRecommendation());
    oldFeedback.setOverallAssement(feedback.getOverallAssement());
    oldFeedback.setAreasForImprovement(feedback.getAreasForImprovement());
    oldFeedback.setKeyStrength(feedback.getKeyStrength());
    oldFeedback.setInterviewDate(feedback.getInterviewDate());
    oldFeedback.setExperience(feedback.getExperience());
    oldFeedback.setCulturalFit(feedback.getCulturalFit());
    oldFeedback.setProblemSolving(feedback.getProblemSolving());
    oldFeedback.setCommunicationSkills(feedback.getCommunicationSkills());
    oldFeedback.setTechnicalSkills(feedback.getTechnicalSkills());
    oldFeedback.setInterviewerName(feedback.getInterviewerName());
    return feedbackRepository.save(oldFeedback);
  }
  @Override
  public List<Feedback> getAllFeedbacks() {
    return feedbackRepository.findAll();
  }

  @Override
  public Feedback findById(Long feedbackId) {

    return feedbackRepository.findById(feedbackId).orElse(null);
  }
}
