// Credit to https://stackoverflow.com/a/16336073
fetch(chrome.runtime.getURL("index.html"))
    .then((r) => r.text())
    .then((html) => {
        // const placeholder = document.createElement("div");
        // placeholder.innerHTML = html;
        // const node = placeholder.firstElementChild;

        // Create elements
        const container = document.createElement("div");
        container.classList.add("wc-ext-container");

        const card = document.createElement("div");
        card.classList.add("wc-ext-card");

        const h1 = document.createElement("h1");
        h1.textContent = "Catonaut";

        const astronautDiv = document.createElement("div");
        astronautDiv.classList.add("wc-ext-astronaut");

        const img = document.createElement("img");
        img.title = "catonaut";
        img.width = 128;
        img.height = 128;
        img.src = "/assets/images/icon128.png";
        img.alt = "catonaut";

        // Append elements to the DOM
        astronautDiv.appendChild(img);
        card.appendChild(h1);
        card.appendChild(astronautDiv);
        container.appendChild(card);

        const style = document.createElement("style");
        style.textContent = `
  :root {
    --primary: rgb(255, 161, 8);
    --gradient-start: rgb(42, 35, 62);
    --gradient-end: rgb(24, 21, 37);
  }

  body {
    margin: 0;
    font-family: BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial,
      sans-serif;
  }
  h1 {
    color: white;
    text-align: center;
    margin-top: 0;
    font-weight: 900;
    margin-bottom: 1.5rem;
  }
  .container {
    background: linear-gradient(
      180deg,
      var(--gradient-start) 50%,
      var(--gradient-end) 100%
    );
    padding: 0.5rem;
  }
  .card {
    background-color: rgba(255, 255, 255, 0.01);
    border-radius: 0.5rem;
    padding: 1rem 1.5rem 1.5rem 1.5rem;
    box-shadow: 0 0 3rem rgba(255, 255, 255, 0.1);
    width: 12rem;
  }
  .astronaut {
    text-align: center;
  }
  img {
    filter: drop-shadow(0 0 1rem cyan);
  }
`;
        document.head.appendChild(style);

        document.body.insertBefore(container, document.body.firstChild);
    });
