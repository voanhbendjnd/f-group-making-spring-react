package tech.djnd.sample.app.service;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.djnd.sample.app.domain.Authority;
import tech.djnd.sample.app.domain.User;
import tech.djnd.sample.app.repository.UserRepository;
import tech.djnd.sample.app.security.SecurityUtils;
import tech.djnd.sample.app.security.SessionManager;
import tech.djnd.sample.app.service.dto.ResLoginDTO;
import tech.djnd.sample.app.service.errors.DataResourceNotFoundException;

import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {
   private final UserRepository userRepository;
    private final SessionManager sessionManager;
    private final SecurityUtils securityUtils;
    public AuthService(UserRepository userRepository, SessionManager sessionManager, SecurityUtils securityUtils) {
        this.userRepository = userRepository;
        this.sessionManager = sessionManager;
        this.securityUtils = securityUtils;
    }
    @Transactional
    public ResLoginDTO generateResLoginDTO(User user){
        ResLoginDTO res = new ResLoginDTO();
        var userLogin = new ResLoginDTO.UserLogin();
        userLogin.setEmail(user.getEmail());
        userLogin.setId(user.getId());
        userLogin.setName(user.getName());
        Set<String> authorityName = user.getAuthorities().stream().map(Authority::getName).collect(Collectors.toSet());
        userLogin.setAuthorities(authorityName);
        String sessionId = sessionManager.initSessionId(user.getId());
        String newAccessToken = securityUtils.createAccessToken(userLogin, sessionId, authorityName);
        res.setUser(userLogin);
        res.setAccessToken(newAccessToken);

        String newRefreshToken = securityUtils.createRefreshToken(userLogin);
        int totalRowChanged = userRepository.updatedRefreshTokenById(userLogin.getId(), newRefreshToken);
        if(totalRowChanged <= 0){
            throw new DataResourceNotFoundException(
                    String.format("User with ID [%d] not found", userLogin.getId()),
                    "userManagement",
                    "idnotfound"
            );
        }
        res.setRefreshToken(newRefreshToken);
        return res;

    }
}
