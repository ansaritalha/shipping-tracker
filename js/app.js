document.addEventListener("DOMContentLoaded", async () => {
  const trackingId = new URLSearchParams(window.location.search).get("id");

  if (!trackingId) {
    document.getElementById("loader").textContent = "Tracking ID not provided.";
    return;
  }

  const checkSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  `;

  const statusSteps = [
  { label: "Auftrag erhalten", icon: checkSVG },
  { label: "Bedarf geprüft", icon: checkSVG },
  { label: "Ware bestellt", icon: checkSVG },
  { label: "Lieferant bestätigt", icon: checkSVG },
  { label: "Lieferung unterwegs", icon: checkSVG },
  { label: "Ware bei uns angekommen", icon: checkSVG },
  { label: "Einrichtung läuft", icon: checkSVG },
  { label: "Einrichtung fertig", icon: checkSVG },
  { label: "Versand/Übergabe an Kunden", icon: checkSVG },
  { label: "Kunde hat Ware erhalten", icon: checkSVG },
  { label: "Projekt abgeschlossen", icon: checkSVG }
];

  function updateVlineHeights() {
    const allSteps = document.querySelectorAll('.status-bar li');

    allSteps.forEach((li, index) => {
      const vline = li.querySelector('.vline');
      const nextLi = allSteps[index + 1];

      if (vline && nextLi) {
        const circle = li.querySelector('.circle');
        const nextCircle = nextLi.querySelector('.circle');

        const circleRect = circle.getBoundingClientRect();
        const nextRect = nextCircle.getBoundingClientRect();

        const distance = nextRect.top - circleRect.bottom;

        if (distance > 0) {
          vline.style.height = `${distance}px`;
        }

        // Set color
        if (li.classList.contains('done')) {
          vline.style.backgroundColor = '#28c76f';
        } else {
          vline.style.backgroundColor = '#ddd';
        }
      }
    });
  }

  try {
    const res = await fetch(`airtable-proxy.php?id=${trackingId}`);
    const data = await res.json();

    if (!data.records || data.records.length === 0) {
      document.getElementById("loader").textContent = "Tracking ID not found.";
      return;
    }

    const record = data.records[0].fields;
    const customerName = record["Name (Client)"] || "Customer";
    const currentStatus = (record["Status"] || "").trim().toLowerCase();
    const activeIndex = statusSteps.findIndex(
      step => step.label.toLowerCase() === currentStatus
    );

    document.getElementById("greeting").textContent = `Hello ${customerName}`;
    document.getElementById("details").textContent = record["More details"] || "";

    if (record["Logo"] && record["Logo"][0]) {
      const logo = document.getElementById("logo");
      logo.src = record["Logo"][0].url;
      logo.style.display = "block";
    }

    document.getElementById("loader").style.display = "none";
    document.getElementById("tracking-card").style.display = "block";

    const statusContainer = document.getElementById("status-line");
    statusContainer.style.display = "flex";
    statusContainer.innerHTML = "";

    let stepDescriptions = {};
    try {
      stepDescriptions = JSON.parse(record["Status Descriptions"] || "{}");
    } catch (e) {
      console.warn("Invalid JSON in Step Descriptions:", e);
    }

    statusSteps.forEach((step, index) => {
      const li = document.createElement("li");
      if (index < activeIndex) li.classList.add("done");
      else if (index === activeIndex) li.classList.add("active");

      const description = stepDescriptions[step.label] || "";
      const trackingNote =
  step.label === "Versand/Übergabe an Kunden" &&
  record["Tracking ID"] &&
  index <= activeIndex
    ? `<div class="tracking-id-note">Tracking ID: ${record["Tracking ID"]}</div>`
    : "";


      li.innerHTML = `
        <div class="circle-column">
          <div class="circle">${step.icon}</div>
          <div class="vline"></div>
        </div>
        <div class="content">
          <div class="label">${step.label}</div>
          <div class="description">${description}</div>
          ${trackingNote}
        </div>
      `;

      statusContainer.appendChild(li);
    });

    // Wait for DOM to paint, then measure and apply vline heights
    setTimeout(updateVlineHeights, 0);

    // Recalculate vline heights on window resize
    window.addEventListener('resize', updateVlineHeights);

  } catch (err) {
    console.error("Error fetching tracking info:", err);
    document.getElementById("loader").textContent = "Error loading tracking data.";
  }
});
