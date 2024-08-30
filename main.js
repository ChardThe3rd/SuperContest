document.addEventListener("DOMContentLoaded", () => {
    // Check if the loginForm, createAccountForm, and forgotPasswordForm elements exist
    const loginForm = document.querySelector("#login");
    const createAccountForm = document.querySelector("#createAccount");
    const forgotPasswordForm = document.querySelector("#forgotPassword");

    // Handle switching between forms on the index.html page
    if (loginForm && createAccountForm && forgotPasswordForm) {
        document.querySelector("#linkCreateAccount").addEventListener("click", e => {
            e.preventDefault();
            loginForm.classList.add("form--hidden");
            createAccountForm.classList.remove("form--hidden");
        });

        document.querySelector("#linkLogin").addEventListener("click", e => {
            e.preventDefault();
            loginForm.classList.remove("form--hidden");
            createAccountForm.classList.add("form--hidden");
        });

        document.querySelector("#linkforgotPassword").addEventListener("click", e => {
            e.preventDefault();
            loginForm.classList.add("form--hidden");
            forgotPasswordForm.classList.remove("form--hidden");
            createAccountForm.classList.add("form--hidden");
        });

        loginForm.addEventListener("submit", e => {
            e.preventDefault();
            // Perform AJAX/Fetch Login
            setFormMessage(loginForm, "error", "Invalid username/password combination");
        });

        document.querySelectorAll(".form__input").forEach(inputElement => {
            inputElement.addEventListener("blur", e => {
                if (e.target.id === "signupUsername" && e.target.value.length > 0 && e.target.value.length < 10) {
                    setInputError(inputElement, "Username must be at least 10 characters in length.");
                }
            });

            inputElement.addEventListener("input", e => {
                clearInputError(inputElement);
            });
        });
    }

    // Handle the checkboxForm on the landing.html page
    const checkboxForm = document.querySelector("#checkboxForm");

    if (checkboxForm) {
        checkboxForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const selectedOptions = Array.from(
                document.querySelectorAll('input[name="option"]:checked')
            ).map((checkbox) => checkbox.value);

            try {
                const response = await fetch("/submit-picks", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ picks: selectedOptions }),
                });

                const data = await response.json();
                console.log(data.message); // Confirmation message
            } catch (error) {
                console.error("Error submitting picks:", error);
            }
        });
    }
});
