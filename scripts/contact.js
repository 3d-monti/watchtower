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
  const earlyAccessValue = isFrench ? "acces-anticipe" : "early-access";
  const earlyAccessCopy = isFrench
    ? {
        emailLabel: "Adresse du compte Google utilisée sur Google Play",
        emailHint: "Indiquez l’adresse exacte du compte Google utilisé sur Google Play. Cette adresse est nécessaire pour vous ajouter à la liste des testeurs.",
        message: [
          "Bonjour,",
          "",
          "Je souhaite rejoindre le programme de testeurs de WATCHTOWER afin de recevoir les prochaines améliorations avant leur publication générale.",
          "",
          "Je confirme que l’adresse indiquée ci-dessus est celle du compte Google que j’utilise sur Google Play.",
          "",
          "Merci."
        ].join("\n")
      }
    : {
        emailLabel: "Google Account email address used on Google Play",
        emailHint: "Enter the exact Google Account email address you use on Google Play. This address is required to add you to the tester list.",
        message: [
          "Hello,",
          "",
          "I would like to join the WATCHTOWER testing programme to receive upcoming improvements before their public release.",
          "",
          "I confirm that the address entered above belongs to the Google Account I use on Google Play.",
          "",
          "Thank you."
        ].join("\n")
      };

  const legacyAutomaticMessages = isFrench
    ? [
        [
          "Bonjour,",
          "",
          "Je souhaite rejoindre le programme de test de WATCHTOWER afin d’accéder aux prochaines versions avant leur publication générale.",
          "",
          "Je confirme que l’adresse indiquée ci-dessus est celle du compte Google que j’utilise sur Google Play.",
          "",
          "Merci."
        ].join("\n"),
        [
          "Bonjour,",
          "",
          "Je souhaite participer au test fermé de WATCHTOWER.",
          "",
          "Je confirme que l’adresse indiquée ci-dessus est celle du compte Google que j’utilise sur Google Play.",
          "",
          "Merci."
        ].join("\n")
      ]
    : [
        [
          "Hello,",
          "",
          "I would like to join the WATCHTOWER testing programme to access upcoming versions before their public release.",
          "",
          "I confirm that the address entered above belongs to the Google Account I use on Google Play.",
          "",
          "Thank you."
        ].join("\n"),
        [
          "Hello,",
          "",
          "I would like to participate in the WATCHTOWER closed test.",
          "",
          "I confirm that the address entered above belongs to the Google Account I use on Google Play.",
          "",
          "Thank you."
        ].join("\n")
      ];

  const syncEarlyAccessFields = () => {
    const earlyAccessSelected = subject.value === earlyAccessValue;
    emailLabel.textContent = earlyAccessSelected ? earlyAccessCopy.emailLabel : defaultEmailLabel;
    emailHint.textContent = earlyAccessSelected ? earlyAccessCopy.emailHint : defaultEmailHint;

    if (earlyAccessSelected && message.value === "") {
      message.value = earlyAccessCopy.message;
    } else if (!earlyAccessSelected && [earlyAccessCopy.message, ...legacyAutomaticMessages].includes(message.value)) {
      message.value = "";
    }
  };

  const params = new URLSearchParams(window.location.search);
  const preselectSubject = () => {
    const motif = params.get("motif");
    if (motif === earlyAccessValue || motif === "test-ferme") {
      subject.value = earlyAccessValue;
    }
  };

  subject.addEventListener("change", syncEarlyAccessFields);
  preselectSubject();
  syncEarlyAccessFields();

  const submitButton = form.querySelector('button[type="submit"]');
  const status = document.querySelector("#contact-form-status");
  if (!submitButton || !status) return;

  const messages = isFrench
    ? {
        idle: "Envoyer",
        sending: "Envoi en cours...",
        successUrl: "./success/",
        error: "L’envoi a échoué. Veuillez réessayer dans quelques instants."
      }
    : {
        idle: "Send",
        sending: "Sending...",
        successUrl: "./success/",
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
      syncEarlyAccessFields();
      window.location.assign(messages.successUrl);
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
