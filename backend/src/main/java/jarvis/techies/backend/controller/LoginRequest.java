package jarvis.techies.backend.controller;

    import lombok.*;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public class LoginRequest {
        private String email;
        private String password;
    }
