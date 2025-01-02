document.addEventListener("DOMContentLoaded", () => {
    const passwordField = document.getElementById("password");
    const confirmPasswordField = document.getElementById("confirmPassword");
    const passwordEyeIcon = document.getElementById("password-eye");
    const confirmPasswordEyeIcon = document.getElementById("confirmPassword-eye");
  
    // Toggle password visibility
    const togglePasswordVisibility = (passwordInput, eyeIcon) => {
      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        eyeIcon.classList.replace("bi-eye-slash", "bi-eye");
      } else {
        passwordInput.type = "password";
        eyeIcon.classList.replace("bi-eye", "bi-eye-slash");
      }
    };
  
    passwordEyeIcon.addEventListener("click", () => togglePasswordVisibility(passwordField, passwordEyeIcon));
    confirmPasswordEyeIcon.addEventListener("click", () => togglePasswordVisibility(confirmPasswordField, confirmPasswordEyeIcon));
  });
  