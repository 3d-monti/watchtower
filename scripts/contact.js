(() => {
  const form = document.querySelector("#contact-form");
  const subject = document.querySelector("#contact-subject");
  const emailLabel = document.querySelector('label[for="contact-email"]');
  const emailHint = document.querySelector("#contact-email-hint");
  const message = document.querySelector("#contact-message");
  if (!form || !subject || !emailLabel || !emailHint || !message) return;

  const isFrench = document.documentElement.lang === "fr";
  const defaultEmailLabel = emailLabel.textContent;
  const defaultEmailHint = emailHint.textContent;
  const closedTestCopy = isFrench
    ? {
        emailLabel: "Adresse du compte Google utilisée sur Google Play",
        emailHint: "Utilisez l’adresse exacte du compte Google avec lequel vous ouvrirez le lien du test. Il peut s’agir d’une adresse Gmail ou d’une autre adresse associée à votre compte Google.",
        message: [
          "Bonjour,",
          "",
          "Je souhaite participer au test fermé de WATCHTOWER.",
          "",
          "Je confirme que l’adresse indiquée ci-dessus est celle du compte Google que j’utilise sur Google Play.",
          "",
          "Modèle de téléphone :",
          "Version d’Android :"
        ].join("\n")
      }
    : {
        emailLabel: "Google Account email address used on Google Play",
        emailHint: "Enter the exact Google Account email address you will use to open the testing link. This may be a Gmail address or another email address associated with your Google Account.",
        message: [
          "Hello,",
          "",
          "I would like to join the WATCHTOWER closed test.",
          "",
          "I confirm that the email address entered above belongs to the Google Account I use on Google Play.",
          "",
          "Phone model:",
          "Android version:"
        ].join("\n")
      };

  const syncClosedTestFields = () => {
    const closedTestSelected = subject.value === "test-ferme";
    emailLabel.textContent = closedTestSelected ? closedTestCopy.emailLabel : defaultEmailLabel;
    emailHint.textContent = closedTestSelected ? closedTestCopy.emailHint : defaultEmailHint;

    if (closedTestSelected && message.value === "") {
      message.value = closedTestCopy.message;
    } else if (!closedTestSelected && message.value === closedTestCopy.message) {
      message.value = "";
    }
  };

  const params = new URLSearchParams(window.location.search);
  const preselectSubject = () => {
    if (params.get("motif") === "test-ferme") {
      subject.value = "test-ferme";
    }
  };

  subject.addEventListener("change", syncClosedTestFields);
  preselectSubject();
  syncClosedTestFields();

  const submitButton = form.querySelector('button[type="submit"]');
  const status = document.querySelector("#contact-form-status");
  if (!submitButton || !status) return;

  const messages = isFrench
    ? {
        idle: "Envoyer",
        sending: "Envoi en cours...",
        success: "Votre message a bien été envoyé. Nous vous répondrons dès que possible.",
        error: "L’envoi a échoué. Veuillez réessayer dans quelques instants."
      }
    : {
        idle: "Send",
        sending: "Sending...",
        success: "Your message has been sent. We’ll reply as soon as possible.",
        error: "The message could not be sent. Please try again in a few moments."
      };

  let isSubmitting = false;

  form.addEventListener("submit", async (event) => {
    if (!form.checkValidity()) {
      event.preventDefault();
      form.reportValidity();
      return;
    }

    event.preventDefault();
    if (isSubmitting) return;

    isSubmitting = true;
    form.setAttribute("aria-busy", "true");
    submitButton.disabled = true;
    submitButton.textContent = messages.sending;
    status.textContent = messages.sending;

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
        signal: controller.signal
      });
      const result = await response.json();

      if (!response.ok || result.success !== true) {
        throw new Error("Submission rejected");
      }

      form.reset();
      preselectSubject();
      syncClosedTestFields();
      status.textContent = messages.success;
    } catch (_error) {
      status.textContent = messages.error;
    } finally {
      window.clearTimeout(timeout);
      form.removeAttribute("aria-busy");
      submitButton.disabled = false;
      submitButton.textContent = messages.idle;
      isSubmitting = false;
    }
  });
})();
