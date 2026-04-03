const optionCards = document.querySelectorAll(".option");

optionCards.forEach((card) => {
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const link = card.closest("a");
      if (link) window.location.href = link.href;
    }
  });
});
