package tech.djnd.sample.app.web.rest;

import jakarta.validation.Valid;
import org.apache.hc.core5.http.HttpHeaders;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import tech.djnd.sample.app.domain.User;
import tech.djnd.sample.app.security.AuthoritiesConstants;
import tech.djnd.sample.app.security.CustomUserDetails;
import tech.djnd.sample.app.service.AuthService;
import tech.djnd.sample.app.service.MailService;
import tech.djnd.sample.app.service.NotificationAsyncService;
import tech.djnd.sample.app.service.UserService;
import tech.djnd.sample.app.service.dto.ActivationKeyVerifyDTO;
import tech.djnd.sample.app.service.dto.BatchActivationResultDTO;
import tech.djnd.sample.app.service.dto.ResLoginDTO;
import tech.djnd.sample.app.service.dto.UserDTO;
import tech.djnd.sample.app.service.errors.BadRequestResourceException;
import tech.djnd.sample.app.util.anotation.ApiMessage;
import tech.djnd.sample.app.web.rest.vm.ActivateAccountVM;
import tech.djnd.sample.app.web.rest.vm.LoginVM;
import tech.djnd.sample.app.web.rest.vm.MulUserId;

import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AccountResource {
    private final UserService userService;
    private final AuthenticationManagerBuilder authenticationManagerBuilder;
    private final AuthService authService;
    private final MailService mailService;
    @Value("${djnd.jwt.refresh-token-validity-in-seconds}")
    private Long refreshTokenExpiration;
    private final NotificationAsyncService notificationAsyncService;

    public AccountResource(
            UserService userService,
            AuthenticationManagerBuilder authenticationManagerBuilder,
            AuthService authService,
            MailService mailService,
            NotificationAsyncService notificationAsyncService
    ) {
        this.userService = userService;
        this.authenticationManagerBuilder = authenticationManagerBuilder;
        this.notificationAsyncService = notificationAsyncService;
        this.mailService = mailService;
        this.authService = authService;
    }

    /*
     * vm: username, password
     */
    @PostMapping("/login")
    public ResponseEntity<ResLoginDTO> loginWithEmail(@Valid @RequestBody LoginVM vm) {
        String normalizedEmail = vm.getUsername().trim().toLowerCase(Locale.ENGLISH);
        // check password
        UsernamePasswordAuthenticationToken userToken = new UsernamePasswordAuthenticationToken(normalizedEmail, vm.getPassword());

        try {
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
        } catch (BadCredentialsException ex) {
            throw new tech.djnd.sample.app.web.rest.errors.BadCredentialsException();
        }
    }

    @PostMapping("/activate")
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    @ApiMessage("Activation email request accepted successfully")
    public void sendRequestActivateAccount(@RequestBody(required = false) Map<String, Object> mp) {
        String email = mp == null ? null : (mp.get("email") != null ? mp.get("email").toString() : null);
        Object rawUserId = mp == null ? null : (mp.containsKey("userId") ? mp.get("userId") : mp.get("id"));

        UserDTO dto;
        if (rawUserId != null) {
            Long userId = rawUserId instanceof Number ? ((Number) rawUserId).longValue() : Long.parseLong(rawUserId.toString());
            dto = userService.initActivatedKeyAccountById(userId);
        } else if (email != null && !email.isBlank()) {
            dto = userService.initActivatedKeyAccount(email);
        } else {
            throw new BadRequestResourceException("Email not found", "userManagement", "emailnotfound");
        }
        mailService.sendActivationEmail(dto);
    }

    @PostMapping("/activate/mul")
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    @ApiMessage("Batch activation request accepted successfully")
    public ResponseEntity<BatchActivationResultDTO> sendMulRequestActivateAccount(@Valid @RequestBody MulUserId mulUserId) {
        List<Long> userIds = mulUserId.getUserIds();
        List<Long> distinctUserIds = userIds.stream().distinct().toList();
        List<UserDTO> usersToActivate = userService.initActivateKeyMulAccount(distinctUserIds);
        notificationAsyncService.sendMailActivatedAccount(usersToActivate);

        BatchActivationResultDTO result = BatchActivationResultDTO.builder()
                .totalRequested(distinctUserIds.size())
                .totalProcessed(usersToActivate.size())
                .totalSkippedAlreadyActive(distinctUserIds.size() - usersToActivate.size())
                .sentEmails(usersToActivate.stream().map(UserDTO::getEmail).toList())
                .build();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/account/activate/verify")
    @ApiMessage("Activation key verified successfully")
    public ResponseEntity<ActivationKeyVerifyDTO> verifyActivationKey(@RequestParam("key") String key) {
        ActivationKeyVerifyDTO result = userService.verifyActivationKey(key);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/account/activate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void activateAccount(@Valid @RequestBody ActivateAccountVM vm) {
        userService.activateAccount(vm.getKey(), vm.getPassword());
    }
}
