(() => {
  const form = document.querySelector("#contact-form");
  const subject = document.querySelector("#contact-subject");
  if (!form || !subject) return;

  const params = new URLSearchParams(window.location.search);
  const preselectSubject = () => {
    if (params.get("motif") === "test-ferme") {
      subject.value = "test-ferme";
    }
  };

  preselectSubject();

  const submitButton = form.querySelector('button[type="submit"]');
  const status = document.querySelector("#contact-form-status");
  if (!submitButton || !status) return;

  const isFrench = document.documentElement.lang === "fr";
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
