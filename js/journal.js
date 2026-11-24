const filters = document.querySelector(".journal-filters");

if (filters) {
  const buttons = [...filters.querySelectorAll("button")];
  const articles = [...document.querySelectorAll(".journal-row")];
  const status = document.querySelector(".journal-archive [role='status']");
  filters.hidden = false;

  for (const button of buttons) {
    button.addEventListener("click", () => {
      let visible = 0;
      for (const option of buttons) {
        option.setAttribute("aria-pressed", String(option === button));
      }
      for (const article of articles) {
        const showAll = button === buttons[0];
        article.hidden = article.classList.contains("journal-row--featured") || (!showAll && article.dataset.topic !== button.textContent.trim());
        if (!article.hidden) visible += 1;
      }
      status.textContent = `${visible} ${visible === 1 ? "article" : "articles"} shown`;
    });
  }
}
