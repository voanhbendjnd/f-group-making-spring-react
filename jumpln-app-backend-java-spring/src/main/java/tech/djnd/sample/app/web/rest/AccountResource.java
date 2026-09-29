package tech.djnd.sample.app.web.rest;

import com.cloudinary.provisioning.Account;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.apache.hc.core5.http.HttpHeaders;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import tech.djnd.sample.app.domain.User;
import tech.djnd.sample.app.security.CustomUserDetails;
import tech.djnd.sample.app.service.AuthService;
import tech.djnd.sample.app.service.MailService;
import tech.djnd.sample.app.service.UserService;
import tech.djnd.sample.app.service.dto.ResLoginDTO;
import tech.djnd.sample.app.service.dto.UserDTO;
import tech.djnd.sample.app.service.errors.BadRequestResourceException;
import tech.djnd.sample.app.web.rest.vm.LoginVM;

import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api")
@FieldDefaults(level = AccessLevel.PRIVATE)
@RequiredArgsConstructor
public class AccountResource {
    final UserService userService;
    final AuthenticationManagerBuilder authenticationManagerBuilder;
    final AuthService authService;
    final MailService mailService;
    @Value("${djnd.jwt.refresh-token-validity-in-seconds}")
    private  Long refreshTokenExpiration;


    /*
    * vm: username, password
    * */
    @PostMapping("/login")
    public ResponseEntity<ResLoginDTO> loginWithEmail(@Valid @RequestBody LoginVM vm) {
        String normalizedEmail = vm.getUsername().trim().toLowerCase(Locale.ENGLISH);
        // check password
        UsernamePasswordAuthenticationToken userToken = new UsernamePasswordAuthenticationToken(normalizedEmail, vm.getPassword());

        try{
            Authentication authentication = authenticationManagerBuilder.getObject().authenticate(userToken);
            SecurityContextHolder.getContext().setAuthentication(authentication);
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            User user = userDetails.user();
            ResLoginDTO res = authService.generateResLoginDTO(user);
            ResponseCookie cookie = ResponseCookie.from("refresh_token", res.getRefreshToken())
                    .httpOnly(true)
                    .secure(true)
                    .path("/")
                    .maxAge(refreshTokenExpiration)
                    .sameSite("Strict")
                    .build();
            res.setRefreshToken(null);
            return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(res);
        }
        catch(BadCredentialsException ex){
            throw new tech.djnd.sample.app.web.rest.errors.BadCredentialsException();
        }
    }
    @PostMapping("/activate")
    @ResponseStatus(HttpStatus.OK)
    public void sendRequestActivateAccount(@RequestBody Map<String, String> mp) {
        String email = mp.get("email");
        if(email == null || email.isBlank()){
            throw new BadRequestResourceException("Email not found", "userManagement", "emailnotfound");
        }
        UserDTO dto =  userService.initActivatedKeyAccount(email);
        mailService.sendActivationEmail(dto);
    }
}
