package jarvis.techies.backend.service.impl;

import jarvis.techies.backend.entity.Admin;
import jarvis.techies.backend.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;


    @Service
    public class AdminService {

        @Autowired
        private AdminRepository adminRepository;

        public boolean authenticate(String email, String password) {
            Optional<Admin> optionalAdmin = adminRepository.findByEmail(email);
            return optionalAdmin.map(admin -> admin.getPassword().equals(password)).orElse(false);
        }
}
